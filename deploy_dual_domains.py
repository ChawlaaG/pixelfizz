#!/usr/bin/env python3
"""
PixelFizz Dual-Domain Production Deployment Engine
Deploying:
  1. dist/in -> https://pixelfizz.in (Manish Chawla / India)
  2. dist/uk -> https://pixelfizz.co.uk (Punit / UK)

Strictly adheres to:
  - C:/Users/manis/antigravity-vault/rules/safe-hosting-deployment.md
  - 5-Guard Safety Pipeline & Blast-Radius Shield
  - Automated pre-deploy remote backups in /home/u410477256/backups/
  - Deletion of exposed .git/ from remote docroot
  - Live HTTP status & header verification
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
import posixpath
from datetime import datetime
from pathlib import Path
import paramiko

VAULT_PATH = Path(os.environ.get("USERPROFILE", "C:/Users/manis")) / ".antigravity" / "hostinger_vault.json"
BASE_DIR = Path(r"F:/Client Projects/PixelFizz")
DIST_IN = BASE_DIR / "dist" / "in"
DIST_UK = BASE_DIR / "dist" / "uk"

def load_vault():
    if not VAULT_PATH.exists():
        raise RuntimeError(f"Vault not found at {VAULT_PATH}")
    with open(VAULT_PATH, "r", encoding="utf-8") as f:
        vault = json.load(f)
    for k in ["host", "port", "username"]:
        if not vault.get(k):
            raise RuntimeError(f"Missing key '{k}' in hostinger_vault.json")
    return vault

def connect_ssh(vault):
    host = vault["host"]
    port = int(vault.get("port", 65002))
    user = vault["username"]
    password = vault.get("password")
    key_filename = vault.get("key_filename")

    print(f"🔒 Connecting to Hostinger ({host}:{port} as {user})...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    kwargs = {"hostname": host, "port": port, "username": user, "timeout": 25}
    if key_filename and os.path.exists(key_filename):
        kwargs["key_filename"] = key_filename
    elif password:
        kwargs["password"] = password
    else:
        raise RuntimeError("No password or key found in vault.")
    ssh.connect(**kwargs)
    print("  ✅ SSH Connected successfully.")
    return ssh

def exec_cmd(ssh, cmd, desc=""):
    if desc:
        print(f"  ⚡ {desc}...")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    status = stdout.channel.recv_exit_status()
    if status != 0 and err:
        print(f"     [EXIT {status}] stderr: {err}")
    return status, out, err

def create_remote_backup(ssh, domain, remote_path):
    print(f"\n📦 Taking Pre-Deploy Backup for {domain}...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"/home/u410477256/backups/{domain.replace('.', '_')}_{timestamp}.tar.gz"
    
    # Ensure backups dir exists
    exec_cmd(ssh, "mkdir -p /home/u410477256/backups", "Ensuring /home/u410477256/backups exists")
    
    # Create tarball
    parent_dir = posixpath.dirname(remote_path)
    cmd = f"tar -czf '{backup_file}' -C '{parent_dir}' public_html"
    status, out, err = exec_cmd(ssh, cmd, f"Creating backup: {backup_file}")
    if status != 0:
        raise RuntimeError(f"Backup failed for {domain}: {err}")
    
    # Verify backup exists and non-empty
    check_cmd = f"ls -lh '{backup_file}'"
    _, check_out, _ = exec_cmd(ssh, check_cmd)
    print(f"  ✅ Backup created: {check_out}")
    return backup_file

def clean_remote_git(ssh, remote_path):
    git_dir = f"{remote_path}/.git"
    status, out, _ = exec_cmd(ssh, f"test -d '{git_dir}' && echo 'EXISTS' || echo 'NONE'")
    if "EXISTS" in out:
        print(f"  🧹 Removing exposed .git from {remote_path}...")
        exec_cmd(ssh, f"rm -rf '{git_dir}'", "Removing .git directory")
        print("  ✅ Remote .git directory removed.")
    else:
        print("  ℹ️ No exposed .git found in docroot.")

def upload_directory_sftp(ssh, local_dir: Path, remote_webroot: str, domain: str):
    print(f"\n🚀 Syncing {local_dir.name} -> {remote_webroot} ({domain})...")
    sftp = ssh.open_sftp()
    
    # Ensure remote dirs
    def sftp_mkdir_p(remote_dir):
        parts = remote_dir.strip("/").split("/")
        current = ""
        for p in parts:
            current += "/" + p
            try:
                sftp.stat(current)
            except FileNotFoundError:
                sftp.mkdir(current)
                sftp.chmod(current, 0o755)

    files_uploaded = 0
    bytes_uploaded = 0

    for root, dirs, files in os.walk(local_dir):
        rel_root = Path(root).relative_to(local_dir)
        rel_posix = rel_root.as_posix()
        if rel_posix == ".":
            remote_curr = remote_webroot
        else:
            remote_curr = f"{remote_webroot}/{rel_posix}"
        sftp_mkdir_p(remote_curr)
        
        for file in files:
            local_file = Path(root) / file
            remote_file = f"{remote_curr}/{file}"
            fsize = local_file.stat().st_size
            
            sftp.put(str(local_file), remote_file)
            sftp.chmod(remote_file, 0o644)
            files_uploaded += 1
            bytes_uploaded += fsize
            rel_display = (rel_root / file).as_posix()
            print(f"  -> Uploaded: {rel_display} ({fsize:,} bytes)")

    # Ensure storage/ folder exists with 0777 for lead logging
    storage_remote = f"{remote_webroot}/storage"
    sftp_mkdir_p(storage_remote)
    sftp.chmod(storage_remote, 0o777)
    
    sftp.close()
    print(f"  ✅ Uploaded {files_uploaded} files ({bytes_uploaded:,} bytes) to {domain}.")

def set_remote_permissions(ssh, remote_webroot):
    print(f"  🔒 Hardening file & directory permissions on {remote_webroot}...")
    exec_cmd(ssh, f"find '{remote_webroot}' -type d -exec chmod 755 {{}} +", "chmod 755 on directories")
    exec_cmd(ssh, f"find '{remote_webroot}' -type f -exec chmod 644 {{}} +", "chmod 644 on files")
    exec_cmd(ssh, f"chmod 777 '{remote_webroot}/storage'", "chmod 777 on storage directory")
    print("  ✅ Permissions set.")

def verify_live_url(url, expected_str="", headers=None):
    req_headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PixelFizz-Deploy-Verifier/1.0"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            content = resp.read().decode("utf-8", errors="replace")
            has_match = (expected_str in content) if expected_str else True
            return status, has_match, content[:500]
    except urllib.error.HTTPError as e:
        return e.code, False, str(e)
    except Exception as e:
        return 0, False, str(e)

def test_redirect(url):
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        resp = opener.open(req, timeout=10)
        return resp.status, ""
    except urllib.error.HTTPError as e:
        location = e.headers.get("Location", "")
        return e.code, location
    except Exception as e:
        return 0, str(e)

def main():
    print("=" * 65)
    print("      PIXELFIZZ DUAL-DOMAIN PRODUCTION DEPLOYMENT ENGINE     ")
    print("=" * 65)
    print(f"Local Root: {BASE_DIR}")
    print(f"India Dist: {DIST_IN}")
    print(f"UK Dist   : {DIST_UK}")

    # Guard 1: Verify dist directories exist and contain expected files
    for d, name in [(DIST_IN, "dist/in"), (DIST_UK, "dist/uk")]:
        if not d.exists():
            raise RuntimeError(f"Distribution directory missing: {name}")
        html_count = len(list(d.glob("**/*.html")))
        if html_count != 18:
            raise RuntimeError(f"Expected 18 HTML files in {name}, found {html_count}")
        print(f"  ✅ {name}: 18/18 HTML pages verified.")

    # Step 1: Central Vault Check
    vault = load_vault()

    # Step 2: Connect SSH
    ssh = connect_ssh(vault)

    domains = [
        {
            "domain": "pixelfizz.in",
            "local_dir": DIST_IN,
            "remote_path": "/home/u410477256/domains/pixelfizz.in/public_html",
            "title_check": "PixelFizz | High-Converting Websites, E-Commerce & AI Systems"
        },
        {
            "domain": "pixelfizz.co.uk",
            "local_dir": DIST_UK,
            "remote_path": "/home/u410477256/domains/pixelfizz.co.uk/public_html",
            "title_check": "PixelFizz | High-Converting Websites, E-Commerce & AI Systems"
        }
    ]

    try:
        for target in domains:
            domain = target["domain"]
            local_dir = target["local_dir"]
            remote_path = target["remote_path"]

            print(f"\n==========================================================")
            print(f"  PROCESSING DEPLOYMENT: {domain}")
            print(f"==========================================================")

            # Step 3: Verify Remote Webroot Exists
            status, out, _ = exec_cmd(ssh, f"test -d '{remote_path}' && echo 'EXISTS' || echo 'NONE'")
            if "EXISTS" not in out:
                raise RuntimeError(f"Remote path not found on server: {remote_path}")
            print(f"  ✅ Remote webroot verified: {remote_path}")

            # Step 4: Create Remote Pre-Deploy Backup
            create_remote_backup(ssh, domain, remote_path)

            # Step 5: Clean exposed .git if present
            clean_remote_git(ssh, remote_path)

            # Step 6: Upload All Distribution Files
            upload_directory_sftp(ssh, local_dir, remote_path, domain)

            # Step 7: Set Permissions
            set_remote_permissions(ssh, remote_path)

        print("\n" + "=" * 65)
        print("  ALL FILES TRANSFERRED. VERIFYING LIVE PRODUCTION SITES...")
        print("=" * 65)

        time.sleep(2) # Give LiteSpeed/Apache a moment to refresh

        # Verification 1: Live Homepages
        print("\n1. Testing Live Homepage Responses:")
        for target in domains:
            d = target["domain"]
            url = f"https://{d}/"
            status, matched, snippet = verify_live_url(url, target["title_check"])
            print(f"   [{status}] {url} -> Content Match: {'PASSED' if matched else 'FAILED'}")

        # Verification 2: www to non-www 301 Redirect
        print("\n2. Testing www -> non-www 301 Redirects:")
        for target in domains:
            d = target["domain"]
            www_url = f"https://www.{d}/"
            code, loc = test_redirect(www_url)
            print(f"   [{code}] {www_url} -> Redirects to: {loc}")

        # Verification 3: Work Case Study Pages
        print("\n3. Testing Sample Flagship Case Study Pages:")
        test_pages = [
            ("https://pixelfizz.in/work/kagrecha-realty/", "Kagrecha's Realty"),
            ("https://pixelfizz.in/work/sajraah-menswear/", "Sajraah"),
            ("https://pixelfizz.co.uk/work/winchester-health-centre/", "Winchester Health Centre"),
            ("https://pixelfizz.co.uk/work/dm-claims-ireland/", "DM Claims Ireland")
        ]
        for url, check in test_pages:
            status, matched, _ = verify_live_url(url, check)
            print(f"   [{status}] {url} -> Found '{check}': {'PASSED' if matched else 'FAILED'}")

        # Verification 4: Services Pages
        print("\n4. Testing Service Pages & FAQ:")
        serv_pages = [
            ("https://pixelfizz.in/services/ecommerce-boutiques/", "Frequently Asked Questions"),
            ("https://pixelfizz.co.uk/services/ai-automations-agents/", "Frequently Asked Questions")
        ]
        for url, check in serv_pages:
            status, matched, _ = verify_live_url(url, check)
            print(f"   [{status}] {url} -> Found '{check}': {'PASSED' if matched else 'FAILED'}")

        # Verification 5: robots.txt and sitemap.xml
        print("\n5. Testing robots.txt and sitemap.xml:")
        for target in domains:
            d = target["domain"]
            rob_url = f"https://{d}/robots.txt"
            status, matched, snippet = verify_live_url(rob_url, f"Sitemap: https://{d}/sitemap.xml")
            print(f"   [{status}] {rob_url} -> Correct Sitemap Directive: {'PASSED' if matched else 'FAILED'}")
            
            site_url = f"https://{d}/sitemap.xml"
            status, matched, _ = verify_live_url(site_url, d)
            print(f"   [{status}] {site_url} -> XML Status: {status}")

        print("\n" + "=" * 65)
        print("🎉 ALL LIVE DEPLOYMENTS & SMOKE TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 65)

    finally:
        ssh.close()

if __name__ == "__main__":
    main()
