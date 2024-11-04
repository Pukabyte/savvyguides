# Welcome to RIVEN.
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/davyjonesmedia/tip)

This is an all-in-one plex_debrid rewrite.<br/> 
Search, download, symlink, and rename all your media content in one app.

[![ReadMe Card](https://github-readme-stats.vercel.app/api/pin/?username=rivenmedia&repo=riven&theme=dark)](https://github.com/rivenmedia/riven)

## The workflow:

1. Request content through Plex watchlist, Overseerr, Trakt Lists, and more!
2. Riven scrapes your choices of indexers and selects the best file
3. Riven downloads the file to your Real-debrid account and will search for it in your zurg mount.
4. Riven will symlink, rename the file, and place it inside the symlink path you choose in onboarding. 
5. Riven will create the following child directories inside: movies, shows, anime_movies, anime_shows
6. Plex can see the symlink and can play from this directory /mnt/{librarypath}/movies or /mnt/{librarypath}/shows

### Prerequisites (to follow this guide)

- A real-debrid account - use this link to sign up: [https://real-debrid.com](https://real-debrid.com/?id=8999543)
- A Linux server (I currently run Ubuntu 22.04)
- Docker installed
- Plex running
- Overseerr set up
- Portainer for monitoring (optional)
- Jackett (optional but recommended)

## Zurg

[https://github.com/debridmediamanager/zurg-testing](https://github.com/debridmediamanager/zurg-testing)

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
directories:
  torrents:
    group: 1
    filters:
      - regex: /.*/
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
      - zurgdata:/app/data

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

volumes:
  zurgdata:
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
This configuration stores all torrents to `/mnt/remote/realdebrid/torrents` so that riven can see the torrents when downloading and creating the symlinks.
:::

After you have made these changes in your terminal run `docker compose up -d` 

## Riven

[https://github.com/rivenmedia/riven](https://github.com/rivenmedia/riven)

Firstly create a directory for the data. `mkdir /opt/riven && cd /opt/riven`
Then create the docker compose file. `nano docker-compose.yml` 
:::tip
I have included 2 versions of the docker compose.<br/>
One is a simple riven only, the other (full) is a compose with plex, overseerr & zilean
:::

Copy and paste this into that file:

::: code-group

```yaml [docker-compose.yml]
services:
  riven-frontend:
    image: spoked/riven-frontend:latest
    container_name: riven-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    tty: true
    environment:
      - PUID=1000
      - PGID=1000
      - ORIGIN=http://localhost:3000  # Set to IP or FQDN of the server
      - BACKEND_URL=http://riven:8080
      - DIALECT=postgres
      - DATABASE_URL=postgres://postgres:postgres@riven-db/riven
      - TZ=America/New_York
    depends_on:
      riven:
        condition: service_healthy

  riven:
    image: spoked/riven:latest
    container_name: riven
    restart: unless-stopped
    ports:
      - "8080:8080"
    tty: true
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
      - RIVEN_FORCE_ENV=true
      - RIVEN_DATABASE_HOST=postgresql+psycopg2://postgres:postgres@riven-db/riven
    healthcheck:
      test: curl -s http://localhost:8080 >/dev/null || exit 1
      interval: 30s
      timeout: 10s
      retries: 10
    volumes:
      - ./data:/riven/data
      - /mnt:/mnt
    depends_on:
      riven_postgres:
        condition: service_healthy

  riven_postgres:
    image: postgres:16.3-alpine3.20
    container_name: riven-db
    environment:
      PGDATA: /var/lib/postgresql/data/pgdata
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: riven
    volumes:
      - ./riven-db:/var/lib/postgresql/data/pgdata
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

```yaml [full docker-compose.yml]
services:
  riven-frontend:
    image: spoked/riven-frontend:latest
    container_name: riven-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    tty: true
    environment:
      - PUID=1000
      - PGID=1000
      - ORIGIN=http://localhost:3000  # Set to IP or FQDN of the server
      - BACKEND_URL=http://riven:8080
      - DIALECT=postgres
      - DATABASE_URL=postgres://postgres:postgres@riven-db/riven
      - TZ=America/New_York
    depends_on:
      riven:
        condition: service_healthy

  riven:
    image: spoked/riven:latest
    container_name: riven
    restart: unless-stopped
    ports:
      - "8080:8080"
    tty: true
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - RIVEN_FORCE_ENV=true # forces the use of env vars to be always used!
      - RIVEN_SYMLINK_RCLONE_PATH=/mnt/remote/realdebrid/torrents
      - RIVEN_SYMLINK_LIBRARY_PATH=/mnt/plex # This is the path that symlinks will be placed in
      - RIVEN_DATABASE_HOST=postgresql+psycopg2://postgres:postgres@riven-db/riven
      - RIVEN_DOWNLOADERS_REAL_DEBRID_ENABLED=true
      - RIVEN_DOWNLOADERS_REAL_DEBRID_API_KEY=xxxxx # set your real debrid api key
      - RIVEN_UPDATERS_PLEX_ENABLED=true
      - RIVEN_UPDATERS_PLEX_URL=http://plex:32400
      - RIVEN_UPDATERS_PLEX_TOKEN=xxxxx # set your plex token
      - RIVEN_CONTENT_OVERSEERR_ENABLED=true
      - RIVEN_CONTENT_OVERSEERR_URL=http://overseerr:5055
      - RIVEN_CONTENT_OVERSEERR_API_KEY=xxxxx # set your overseerr token
      - RIVEN_SCRAPING_TORRENTIO_ENABLED=true
      - RIVEN_SCRAPING_ZILEAN_ENABLED=true
      - RIVEN_SCRAPING_ZILEAN_URL=http://zilean:8181
    healthcheck:
      test: curl -s http://localhost:8080 >/dev/null || exit 1
      interval: 30s
      timeout: 10s
      retries: 10
    volumes:
      - ./data:/riven/data
      - /mnt:/mnt
    depends_on:
      riven_postgres:
        condition: service_healthy

  riven_postgres:
    image: postgres:16.3-alpine3.20
    container_name: riven-db
    restart: unless-stopped
    environment:
      PGDATA: /var/lib/postgresql/data/pgdata
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: riven
    volumes:
      - ./riven-db:/var/lib/postgresql/data/pgdata
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  ## Plex (optional media server)

  plex:
    image: plexinc/pms-docker:latest
    container_name: plex
    restart: unless-stopped
    ports:
      - "32400:32400"
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - VERSION=docker
    volumes:
      - ./config:/config
      - /mnt:/mnt
    devices:
      - "/dev/dri:/dev/dri"

  ## Overseerr (optional content service)

  overseerr:
    image: lscr.io/linuxserver/overseerr:latest
    container_name: overseerr
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
    ports:
      - 5055:5055

  ## Zilean (optional scraper service)

  zilean:
    image: ipromknight/zilean:latest
    container_name: zilean
    restart: unless-stopped
    ports:
      - "8181:8181"
    volumes:
      - ./zilean/data:/app/data
    environment:
        Zilean__ElasticSearch__Url: http://elasticsearch:9200
    healthcheck:
      test: curl --connect-timeout 10 --silent --show-error --fail http://localhost:8181/healthchecks/ping
      timeout: 60s
      interval: 30s
      retries: 10
    depends_on:
      elasticsearch:
        condition: service_healthy

  elasticsearch:
    image: elasticsearch:8.14.1@sha256:ff3998ab3d8a84984e5298d33d01a174fc5f8abed15ad58d0a54364fc63d68d9
    container_name: elasticsearch
    environment:
      ES_SETTING_DISCOVERY_TYPE: single-node
      ES_SETTING_XPACK_SECURITY_ENABLED: false
      ES_SETTING_BOOTSTRAP_MEMORY__LOCK: true
      ES_JAVA_OPTS: "-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
      - "9300:9300"
    healthcheck:
      test: curl -s http://localhost:9200 >/dev/null || exit 1
      interval: 30s
      timeout: 10s
      retries: 10
    volumes:
      - ./zilean/elastic_data:/usr/share/elasticsearch/data:rw
```

:::

:::info
Once you have saved that, create a directory for your library.<br/>
In this guide we are going to use /mnt/plex so do `mkdir /mnt/plex`

now you can run `docker compose up -d` 
:::

:::tip
Once the containers are up and running, navigate to the UI using the URL you put as ORIGIN in the docker-compose.yml.
:::

### Onboarding

Setup Riven with the following settings:

### Step 1

![alt text](/screenshots/riven/step1.png)

### Step 2

![alt text](/screenshots/riven/step2.png)

### Step 3

![alt text](/screenshots/riven/step3.png)

### Step 4

![alt text](/screenshots/riven/step4.png)

### **Completed!**

![alt text](/screenshots/riven/complete.png)

After everything validates correctly, it will bring you to the home page. 