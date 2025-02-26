# Zurg

A custom-built, self-hosted Real-Debrid WebDAV server. Combined with rclone, it allows you to mount your Real-Debrid torrent library into your file system, similar to Dropbox. It is designed for use with Infuse (WebDAV server) and Plex (mounting Zurg WebDAV with rclone).

Public Repo: 
[![ReadMe Card](https://github-readme-stats.vercel.app/api/pin/?username=debridmediamanager&repo=zurg-testing&theme=dark)](https://github.com/debridmediamanager/zurg-testing) <br/>
Sponsors only: <br/>
https://github.com/debridmediamanager/zurg

## Download

[Release Cycle](https://github.com/debridmediamanager/zurg-testing/wiki/Release-cycle)

### Latest version: v0.10.0-rc.4-1 (Sponsors only)

[Download the binary](https://github.com/debridmediamanager/zurg/releases) or use docker

Instructions on [HOW TO PULL THE PRIVATE DOCKER IMAGE](https://www.patreon.com/posts/guide-to-pulling-105779285)

Also the [CONFIG guide for v0.10](https://github.com/debridmediamanager/zurg-testing/wiki/Config-v0.10)

```sh
docker pull ghcr.io/debridmediamanager/zurg:latest
# or
docker pull ghcr.io/debridmediamanager/zurg:v0.10.0-rc.4-1
```

### Stable version: v0.9.3-final (Public)

[Download the binary](https://github.com/debridmediamanager/zurg-testing/releases) or use docker

```sh
docker pull ghcr.io/debridmediamanager/zurg-testing:latest
# or
docker pull ghcr.io/debridmediamanager/zurg-testing:v0.9.3-final
```
## Setup

Setup Zurg with these steps:<br/>
```bash
cd /opt 
mkdir zurg-testing
cd /opt/zurg-testing 
```
:::tip
You will now be inside zurgs directory where you will create and edit the needed files.<br/>
Now you can `nano` each file and copy/paste the content below into your local files. <br/>
Eg. `nano config.yml` 
:::

::: code-group

```yaml [config.yml]
# Zurg configuration version
zurg: v1
token: ENTER REAL-DEBRID API TOKEN HERE # https://real-debrid.com/apitoken
# host: "[::]"
# port: 9999
# username:
# password:
# proxy:
api_rate_limit_per_minute: 60
torrents_rate_limit_per_minute: 25
concurrent_workers: 32
check_for_changes_every_secs: 10
# repair_every_mins: 60
ignore_renames: true
retain_rd_torrent_name: true
retain_folder_name_extension: true
enable_repair: false
auto_delete_rar_torrents: false
get_torrents_count: 5000
# api_timeout_secs: 15
# download_timeout_secs: 10
# enable_download_mount: false
# rate_limit_sleep_secs: 6
# retries_until_failed: 2
# network_buffer_size: 4194304 # 4MB
# serve_from_rclone: false
# verify_download_link: false
# force_ipv6: false
```

```yaml [docker-compose.yml]
version: '3.8'
services:
  zurg:
    image: ghcr.io/debridmediamanager/zurg-testing:v0.9.3-final
    container_name: zurg
    restart: unless-stopped
    healthcheck:
      test: curl -f localhost:9999/dav/version.txt || exit 1
    ports:
      - 9999:9999
    volumes:
      - ./config.yml:/app/config.yml
      - ./data:/app/data

  rclone:
    image: rclone/rclone:latest
    container_name: rclone
    restart: unless-stopped
    environment:
      TZ: Europe/Berlin
      PUID: 1000
      PGID: 1000
    volumes:
      - /mnt/remote/realdebrid:/data:rshared
      - /opt/zurg-testing/rclone.conf:/config/rclone/rclone.conf
      - /mnt:/mnt
    cap_add:
      - SYS_ADMIN
    security_opt:
      - apparmor:unconfined
    devices:
      - /dev/fuse:/dev/fuse:rwm
    depends_on:
      zurg:
        condition: service_healthy
        restart: true
    command: "mount zurg: /data --allow-non-empty --allow-other --uid=1000 --gid=1000 --umask=002 --dir-cache-time 10s"
```

```bash [rclone.conf]
[zurg]
type = webdav
url = http://zurg:9999/dav
vendor = other
pacer_min_sleep = 0
```

:::

:::info
This configuration stores all torrents to `/mnt/remote/realdebrid/__all__` so that blackhole can see the torrents when downloading and creating the symlinks.
:::

A web server is now running at `localhost:9999`.

### Note: when using zurg in a server outside of your home network, ensure that "Use my Remote Traffic automatically when needed" is unchecked on your [Account page](https://real-debrid.com/account)

## Command-line utility

```
Usage:
  zurg [flags]
  zurg [command]

Available Commands:
  clear-downloads Clear all downloads (unrestricted links) in your account
  clear-torrents  Clear all torrents in your account
  completion      Generate the autocompletion script for the specified shell
  help            Help about any command
  network-test    Run a network test
  version         Prints zurg's current version

Flags:
  -c, --config string   config file path (default "./config.yml")
  -h, --help            help for zurg

Use "zurg [command] --help" for more information about a command.
```

## Why zurg? Why not X?

- Better performance than anything out there; changes in your library appear instantly ([assuming Plex picks it up fast enough](./plex_update.sh))
- You can configure a flexible directory structure in `config.yml`; you can select individual torrents that should appear on a directory by the ID you see in [DMM](https://debridmediamanager.com/). [Need help?](https://github.com/debridmediamanager/zurg-testing/wiki/Config)
- If you've ever experienced Plex scanner being stuck on a file and thereby freezing Plex completely, it should not happen anymore because zurg does a comprehensive check if a torrent is dead or not. You can run `ps aux --sort=-time | grep "Plex Media Scanner"` to check for stuck scanner processes.
- zurg guarantees that your library is **always available** because of its repair abilities!

## Please read our [wiki](https://github.com/debridmediamanager/zurg-testing/wiki) for more information!

## [zurg's version history](https://github.com/debridmediamanager/zurg-testing/wiki/History)
