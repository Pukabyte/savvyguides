# A Sailarr’s Guide to Plex + Real-Debrid


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/davyjonesmedia/tip)

::: tip
👋🏼 If you need any assistance with this come find me on discord ***@thebropuks***
:::

:::info ⭐ Special Mentions

@yowmamasita - Creator of [DebridMediaManager](https://debridmediamanager.com) and Zurg!<br/>
@spoked - Creator of [Riven](https://github.com/rivenmedia/riven) and the [Torrentio indexer](https://github.com/dreulavelle/Prowlarr-Indexers) for Powlarr!<br/>
@west - Creator of the [Scripts](https://github.com/westsurname/scripts) repository
:::

### This is a working version of deploying a complete Debrid Media Server
:::tip
To make it all happen we will only need 1 main volume-mapped path on all containers: `/mnt:/mnt`
:::

I have set up my Ubuntu server using Saltbox.<br/>
Find out more by clicking the link below:

[Saltbox Documentation](https://docs.saltbox.dev/)

### Prerequisites

- A Linux server (I currently run Ubuntu 22.04)
- Docker installed
- Portainer installed (optional, but recommended)
- General knowledge of Linux and Docker images
- A real-debrid account<br/>
you can sign up for an account here: [http://real-debrid.com](http://real-debrid.com/?id=8999543)

## Zurg

[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=debridmediamanager&repo=zurg-testing&theme=dark)](https://github.com/debridmediamanager/zurg-testing)

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
serve_from_rclone: true
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

:::warning
If you followed my guide before this point, you will see we have changed a couple settings in the zurg config.<br/>
This was to allow the blackhole script to work properly.<br/>
You can use this script in the link below to rewrite your symlinks to work with the new config.

Here are the settings in the config.yml that were changed:

```
retain_rd_torrent_name: true
retain_folder_name_extension: true
```
:::

[zurg_symlink_update.py](https://github.com/westsurname/scripts/blob/main/zurg_symlink_update.py)

## Create a Library Directory

You will need to create a library directory for plex. eg `mkdir /mnt/plex`<br/>
Inside that directory, you will need a folder for each library you plan on using in Plex. eg. `mkdir /mnt/plex/Movies`

:::tip
**The Plex directory is what you will also use as the root folder in Radarr & Sonarr**
:::

You will also need to create a directory for your symlinks eg. `mkdir /mnt/symlinks`<br/>
Inside that directory, you will need a folder for each instance of *arrs `mkdir /mnt/symlinks/radarr`

After you’re finished it will look something like this:<br/>
```
mnt
 ├── symlinks
 │   ├── radarr
 │   ├── sonarr
 │   ├── radarr4k
 │   └── sonarr4k
 └── plex
     ├── Movies
     ├── TV
     ├── Movies - 4K
     └── TV - 4K
```

Setup your library directory and start mapping your plex libraries to them.

## Plex

Set up plex as per usual, and make sure you have added the following volume mapping: `/mnt:/mnt`<br/>
**Please note**: this needs to be added to all containers that need access to the realdebrid mount for symlinks to validate eg. : plex, radarr, sonarr, rdt or any other service.

```yaml
    volumes:
      - /mnt:/mnt
```

## Radarr & Sonarr
### Setup
:::info
Setup up your *arrs apps.<br/>
(I currently have 3 of each setup for separating qualities and anime.)<br/>
*arr HD, *arr 4k, *arr Anime.<br/>
You will also need to add the following volume mapping to each instance:
    
```yaml
    volumes:
      - /mnt:/mnt
```
:::
    
:::tip
Once you have your *arrs apps running, you will need to create the folders inside `/mnt/symlinks` for each instance. for example: `mkdir /mnt/symlinks/radarr`<br/>
These are the categories that Blackhole will put your symlinks when it has found on your zurg mount.<br/>
Your *arr app will pick it up from here and import it into the root folder you have setup in *arr<br/>
2. **Root Folders will be the same as the Plex directory we made earlier. point your Arr to the corresponding plex library eg. `/mnt/plex/Movies`**
:::

### Arr Syncing
:::tip
The easiest way I’ve found to manage the multiple instances is to Sync the 4K and 4K DV instances to my HD instance through list syncs. This is optional however.
:::    

### Advanced Settings
    
Here we will look at the advanced setup of custom formats and renaming.
All the information can be found in the link below.
:::tip
- I highly recommend looking at the `Recommended Naming Scheme` for both Radarr and Sonarr
- I also highly recommend looking at the `Quality Profiles` and `Collection Of Custom Formats`
- There is also recyclarr and [notifiarr](/settings/notifiarr) that will help automate the setup for you.
:::
    
--> [Trash-Guides](https://trash-guides.info/) <--
    

## Blackhole Script
[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=westsurname&repo=scripts&theme=dark)](https://github.com/westsurname/scripts)
@west has created an amazing repository of scripts for realdebrid.<br/>
This is also where we will find the blackhole script.

:::info
❓ What is the blackhole script?<br/>
it's a torrent blackhole downloader that we can use any public indexer with.
:::

:::info
**Features:**
- Checks each torrent for cached status and fails it in the arrs if not, triggering a re-search for another release
- Creates a symlink and then tells the arrs about it
- Arrs can then import from there
- Quicker than rdtclient
- A few other handy scripts to manage your debrid library

**Cons:**
- ~~No ability to download uncached content yet~~
- No fancy gui.. yet 
:::

Setup blackhole with these steps:
```bash
cd /opt
git clone https://github.com/westsurname/scripts.git blackhole
cd blackhole
nano .env
```
Copy and paste the following `docker-compose.yml`and `.env` configs and replace all placeholders in `.env` with your credentials

::: code-group
```bash [.env]
#------------------------------------------------------#
# ███████╗ ██████╗██████╗ ██╗██████╗ ████████╗███████╗ #
# ██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝██╔════╝ #
# ███████╗██║     ██████╔╝██║██████╔╝   ██║   ███████╗ #
# ╚════██║██║     ██╔══██╗██║██╔═══╝    ██║   ╚════██║ #
# ███████║╚██████╗██║  ██║██║██║        ██║   ███████║ #
# ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   ╚══════╝ #
# Created by @westsurname                              #
#                                                      #
# The headings contain the scripts that require the    #
# the variables within.                                #
#------------------------------------------------------#

#--------#
# SERVER #
#--------#

SERVER_DOMAIN=<server_domain>

#-------------------------------------------------------------------#
# PLEX - WATCHLIST, PLEX AUTHENTICATION, PLEX REQUEST, PLEX REFRESH #
#-------------------------------------------------------------------#

PLEX_HOST="https://plex.tv/"
PLEX_METADATA_HOST="https://metadata.provider.plex.tv/"
PLEX_SERVER_HOST=<plex_server_host>
PLEX_SERVER_MACHINE_ID=<plex_server_machine_id>
PLEX_SERVER_API_KEY=<plex_server_api_key>
PLEX_SERVER_MOVIE_LIBRARY_ID=<plex_server_movie_library_id>
PLEX_SERVER_TV_SHOW_LIBRARY_ID=<plex_server_tv_show_library_id>
PLEX_SERVER_PATH=<plex_server_path>

#-------------------------------------------------------------------------#
# OVERSEERR - WATCHLIST, PLEX AUTHENTICATION, PLEX REQUEST, RECLAIM SPACE #
#-------------------------------------------------------------------------#

OVERSEERR_HOST=http://overseerr:5055
OVERSEERR_API_KEY=<overseerr_api_key>

#------------------------------------------------------------------------------------#
# SONARR - BLACKHOLE, REPAIR, IMPORT TORRENT FOLDER, RECLAIM SPACE, ADD NEXT EPISODE #
#------------------------------------------------------------------------------------#

SONARR_HOST=http://sonarr:8989
SONARR_API_KEY=<sonarr_api_key>
SONARR_ROOT_FOLDER="/mnt/plex/TV"

SONARR_HOST_4K=<sonarr_host_4k>
SONARR_API_KEY_4K=<sonarr_api_key_4k>
SONARR_ROOT_FOLDER_4K="/mnt/plex/TV - 4K"

SONARR_HOST_ANIME=<sonarr_host_anime>
SONARR_API_KEY_ANIME=<sonarr_api_key_anime>
SONARR_ROOT_FOLDER_ANIME="/mnt/plex/TV - Anime"

SONARR_HOST_MUX=<sonarr_host_mux>
SONARR_API_KEY_MUX=<sonarr_api_key_mux>
SONARR_ROOT_FOLDER_MUX="/mnt/plex/TV - Remux"

#------------------------------------------------------------------#
# RADARR - BLACKHOLE, REPAIR, IMPORT TORRENT FOLDER, RECLAIM SPACE #
#------------------------------------------------------------------#

RADARR_HOST=http://radarr:7878
RADARR_API_KEY=<radarr_api_key>
RADARR_ROOT_FOLDER="/mnt/plex/Movies"

RADARR_HOST_4K=<radarr_host_4k>
RADARR_API_KEY_4K=<radarr_api_key_4k>
RADARR_ROOT_FOLDER_4K="/mnt/plex/Movies - 4K"

RADARR_HOST_ANIME=<radarr_host_anime>
RADARR_API_KEY_ANIME=<radarr_api_key_anime>
RADARR_ROOT_FOLDER_ANIME="/mnt/plex/Movies - Anime"

RADARR_HOST_MUX=<radarr_host_mux>
RADARR_API_KEY_MUX=<radarr_api_key_mux>
RADARR_ROOT_FOLDER_MUX="/mnt/plex/Movies - Remux"

#--------------------------#
# TAUTULLI - RECLAIM SPACE #
#--------------------------#

TAUTULLI_HOST=<tautulli_host>
TAUTULLI_API_KEY=<tautulli_api_key>

#-------------------------------#
# REALDEBRID - BLACKHOLE, REPAIR #
#-------------------------------#

REALDEBRID_ENABLED=true
REALDEBRID_HOST="https://api.real-debrid.com/rest/1.0/"
REALDEBRID_API_KEY=<realdebrid_api_key> # https://real-debrid.com/apitoken
REALDEBRID_MOUNT_TORRENTS_PATH="/mnt/remote/realdebrid/__all__"

#---------------------------#
# TORBOX - BLACKHOLE, REPAIR #
#---------------------------#

TORBOX_ENABLED=false
TORBOX_HOST="https://api.torbox.app/v1/api/"
TORBOX_API_KEY=<torbox_api_key>
TORBOX_MOUNT_TORRENTS_PATH="/mnt/remote/torbox"

#-----------------------#
# TRAKT - RECLAIM SPACE #
#-----------------------#

TRAKT_API_KEY=<trakt_api_key>

#-------------------------------------#
# WATCHLIST - WATCHLIST, PLEX REQUEST #
#-------------------------------------#

WATCHLIST_PLEX_PRODUCT="Plex Request Authentication"
WATCHLIST_PLEX_VERSION="1.0.0"
WATCHLIST_PLEX_CLIENT_IDENTIFIER="576101fc-b425-4685-91cb-5d3c1671fd2b"

#-----------------------#
# BLACKHOLE - BLACKHOLE #
#-----------------------#

BLACKHOLE_BASE_WATCH_PATH="/mnt/symlinks"
BLACKHOLE_RADARR_PATH="radarr"
BLACKHOLE_SONARR_PATH="sonarr"
BLACKHOLE_FAIL_IF_NOT_CACHED=true
BLACKHOLE_RD_MOUNT_REFRESH_SECONDS=200
BLACKHOLE_WAIT_FOR_TORRENT_TIMEOUT=300
BLACKHOLE_HISTORY_PAGE_SIZE=500

#-----------------------------------------------------------------------------------------------#
# DISCORD - BLACKHOLE, WATCHLIST, PLEX AUTHENTICATION, PLEX REQUEST, MONITOR RAM, RECLAIM SPACE #
#-----------------------------------------------------------------------------------------------#

DISCORD_ENABLED=false
DISCORD_UPDATE_ENABLED=false
DISCORD_WEBHOOK_URL=<discord_webhook_url>

#-----------------#
# REPAIR - REPAIR #
#-----------------#

REPAIR_REPAIR_INTERVAL="10m"
REPAIR_RUN_INTERVAL="1d"

#-----------------------#
# GENERAL CONFIGURATION #
#-----------------------#

PYTHONUNBUFFERED=TRUE
PUID=1000
PGID=1000
UMASK=002
DOCKER_NETWORK="scripts_default"
DOCKER_NETWORK_EXTERNAL=false
```

```yaml [docker-compose.yml]
#------------------------------------------------------------------------------------#
# created     ██████╗ ██████╗ ███╗   ███╗██████╗  ██████╗ ███████╗███████╗           #
# by @west   ██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔═══██╗██╔════╝██╔════╝           #
#            ██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║███████╗█████╗             #
#            ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║╚════██║██╔══╝             #
#           ╚ ██████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝███████║███████╗           #
#             ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝ ╚══════╝╚══════╝           #
#                                                                                    #
# COMMANDS:                                                                          #
# docker compose --profile {tag} up -d                                               #
# TAGS:                                                                              #
# all = all containers in the compose                                                #
# blackhole = blackhole, blackhole_4k, blackhole_anime, blackhole_mux, blackhole_all #
# repair = repair, repair_4k, repair_anime, repair_mux repair_all                    #
#------------------------------------------------------------------------------------#

x-blackhole: &blackhole
  build: 
    context: .
    dockerfile: Dockerfile.blackhole
  image: ghcr.io/westsurname/scripts/blackhole:latest
  pull_policy: always
  user: "${PUID:-}${PGID:+:${PGID}}"
  env_file:
    - .env
  restart: unless-stopped

x-repair: &repair
  build: 
    context: .
    dockerfile: Dockerfile.scripts
  image: ghcr.io/westsurname/scripts/scripts:latest
  user: "${PUID:-}${PGID:+:${PGID}}"
  pull_policy: always
  command: python repair.py --no-confirm
  env_file:
    - .env
  restart: unless-stopped

services:
  blackhole:
    <<: *blackhole
    container_name: blackhole
    environment:
      - BLACKHOLE_BASE_WATCH_PATH=/${BLACKHOLE_BASE_WATCH_PATH}
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH}:${REALDEBRID_MOUNT_TORRENTS_PATH}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}
    profiles: [blackhole, blackhole_all, all]

  blackhole_4k:
    <<: *blackhole
    container_name: blackhole4k
    environment:
      - SONARR_HOST=${SONARR_HOST_4K}
      - SONARR_API_KEY=${SONARR_API_KEY_4K}
      - RADARR_HOST=${RADARR_HOST_4K}
      - RADARR_API_KEY=${RADARR_API_KEY_4K}
      - BLACKHOLE_BASE_WATCH_PATH=/${BLACKHOLE_BASE_WATCH_PATH}
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH}:${REALDEBRID_MOUNT_TORRENTS_PATH}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}4k:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}4k:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}
    profiles: [blackhole_4k, blackhole_all, all]

  blackhole_anime:
    <<: *blackhole
    container_name: blackholeanime
    environment:
      - SONARR_HOST=${SONARR_HOST_ANIME}
      - SONARR_API_KEY=${SONARR_API_KEY_ANIME}
      - RADARR_HOST=${RADARR_HOST_ANIME}
      - RADARR_API_KEY=${RADARR_API_KEY_ANIME}
      - BLACKHOLE_BASE_WATCH_PATH=/${BLACKHOLE_BASE_WATCH_PATH}
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH}:${REALDEBRID_MOUNT_TORRENTS_PATH}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}anime:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}anime:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}
    profiles: [blackhole_anime, blackhole_all, all]

  blackhole_mux:
    <<: *blackhole
    container_name: blackholemux
    environment:
      - SONARR_HOST=${SONARR_HOST_MUX}
      - SONARR_API_KEY=${SONARR_API_KEY_MUX}
      - RADARR_HOST=${RADARR_HOST_MUX}
      - RADARR_API_KEY=${RADARR_API_KEY_MUX}
      - BLACKHOLE_BASE_WATCH_PATH=/${BLACKHOLE_BASE_WATCH_PATH}
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH}:${REALDEBRID_MOUNT_TORRENTS_PATH}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}mux:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}mux:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}
    profiles: [blackhole_mux, blackhole_all, all]

  repair_service:
    <<: *repair
    container_name: repair
    environment:
      - SONARR_HOST=${SONARR_HOST}
      - SONARR_API_KEY=${SONARR_API_KEY}
      - RADARR_HOST=${RADARR_HOST}
      - RADARR_API_KEY=${RADARR_API_KEY}
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH}:${REALDEBRID_MOUNT_TORRENTS_PATH}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${SONARR_ROOT_FOLDER}:${SONARR_ROOT_FOLDER}
      - ${RADARR_ROOT_FOLDER}:${RADARR_ROOT_FOLDER}
      - /mnt:/mnt
    profiles: [repair, repair_all, all]

  repair_4k:
    <<: *repair
    container_name: repair4k
    environment:
      - SONARR_HOST=${SONARR_HOST_4K}
      - SONARR_API_KEY=${SONARR_API_KEY_4K}
      - RADARR_HOST=${RADARR_HOST_4K}
      - RADARR_API_KEY=${RADARR_API_KEY_4K}
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH}:${REALDEBRID_MOUNT_TORRENTS_PATH}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${SONARR_ROOT_FOLDER_4K}:${SONARR_ROOT_FOLDER}
      - ${RADARR_ROOT_FOLDER_4K}:${RADARR_ROOT_FOLDER}
      - /mnt:/mnt
    profiles: [repair_4k, repair_all, all]

  repair_anime:
    <<: *repair
    container_name: repairanime
    environment:
      - SONARR_HOST=${SONARR_HOST_ANIME}
      - SONARR_API_KEY=${SONARR_API_KEY_ANIME}
      - RADARR_HOST=${RADARR_HOST_ANIME}
      - RADARR_API_KEY=${RADARR_API_KEY_ANIME}
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH}:${REALDEBRID_MOUNT_TORRENTS_PATH}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${SONARR_ROOT_FOLDER_ANIME}:${SONARR_ROOT_FOLDER}
      - ${RADARR_ROOT_FOLDER_ANIME}:${RADARR_ROOT_FOLDER}
      - /mnt:/mnt
    profiles: [repair_anime, repair_all, all]

  repair_mux:
    <<: *repair
    container_name: repairmux
    environment:
      - SONARR_HOST=${SONARR_HOST_MUX}
      - SONARR_API_KEY=${SONARR_API_KEY_MUX}
      - RADARR_HOST=${RADARR_HOST_MUX}
      - RADARR_API_KEY=${RADARR_API_KEY_MUX}
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH}:${REALDEBRID_MOUNT_TORRENTS_PATH}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${SONARR_ROOT_FOLDER_MUX}:${SONARR_ROOT_FOLDER}
      - ${RADARR_ROOT_FOLDER_MUX}:${RADARR_ROOT_FOLDER}
      - /mnt:/mnt
    profiles: [repair_mux, repair_all, all]

  watchlist:
    build: 
      context: .
      dockerfile: Dockerfile.watchlist
    container_name: watchlist_service
    image: ghcr.io/westsurname/scripts/watchlist:latest
    pull_policy: always
    volumes:
      - ./shared/tokens.json:/app/shared/tokens.json
      - ./sockets:/app/sockets
    env_file:
      - .env
    restart: unless-stopped
    profiles: [watchlist, all]

  plex_authentication:
    build: 
      context: .
      dockerfile: Dockerfile.plex_authentication
    container_name: plex_authentication_service
    image: ghcr.io/westsurname/scripts/plex_authentication:latest
    pull_policy: always
    volumes:
      - ./shared/tokens.json:/app/shared/tokens.json
      - ./sockets:/app/sockets
    ports:
      - 8010:8000
    env_file:
      - .env
    restart: unless-stopped
    profiles: [plex_authentication, watchlist, plex_request, all]

  plex_request:
    build: 
      context: .
      dockerfile: Dockerfile.plex_request
    container_name: plex_request_service
    image: ghcr.io/westsurname/scripts/plex_request:latest
    pull_policy: always
    volumes:
      - ./shared/tokens.json:/app/shared/tokens.json
      - ./sockets:/app/sockets
    ports:
      - 8011:8000
    env_file:
      - .env
    restart: unless-stopped
    profiles: [plex_request, all]

  plex_request_nginx:
    build:
      context: .
      dockerfile: Dockerfile.plex_request_nginx
    container_name: plex_request_nginx_service
    image: ghcr.io/westsurname/scripts/plex_request_nginx:latest
    pull_policy: always
    volumes:
      - ${PLEX_SERVER_PATH}:/plex:ro
      - ./sockets:/app/sockets
    ports:
      - 8012:8000
    env_file:
      - .env
    restart: unless-stopped
    profiles: [plex_request, all]
    depends_on:
      - plex_request

networks:
  default:
    name: ${DOCKER_NETWORK:-scripts_default}
    external: ${DOCKER_NETWORK_EXTERNAL:-false}
```

:::

You will need to make a directory for each radarr/sonarr instance:
```bash
mkdir -p /mnt/symlinks/radarr/completed
mkdir -p /mnt/symlinks/radarr4k/completed
mkdir /mnt/symlinks/radarranime && mkdir /mnt/symlinks/radarranime/completed
mkdir /mnt/symlinks/sonarr && mkdir /mnt/symlinks/sonarr/completed
mkdir /mnt/symlinks/sonarr4k && mkdir /mnt/symlinks/sonarr4k/completed
mkdir /mnt/symlinks/sonarranime && mkdir /mnt/symlinks/sonarranime/completed
```
To deploy blackhole, run the following command

:::tip
- `-d` is optional, this will compose up in detatched mode<br/>
- Without `-d` it will launch into the terminal logs<br/>
- To exit from terminal logs, use `ctrl + z`
:::

::: code-group

```python [single instance]
docker compose --profile blackhole up -d
```

```python [all instances]
docker compose --profile blackhole_all up -d
```

:::

Once this is up and running, you can follow these instructions to set up the blackhole downloader in the arrs:
    
**Blackhole Arrs Setup**
    
Navigate to `Settings > Download Clients` <br/>
Add the `Torrent Blackhole` client.
    
Configure the blackhole client as follows:

::: code-group

```bash [radarr]    
Name: Blackhole
Enable: Yes
Torrent Folder: /mnt/symlinks/radarr
Watch Folder: Set to /mnt/symlinks/radarr/completed
Save Magnet Files: Yes, with the extension .magnet
Read Only: No
Client Priority: Prioritize as you please
Tags: (optional) leave this blank unless you know how it works
Completed Download Handling: Remove Completed
```

```bash [sonarr]    
Name: Blackhole
Enable: Yes
Torrent Folder: /mnt/symlinks/sonarr
Watch Folder: /mnt/symlinks/sonarr/completed
Save Magnet Files: Yes, with the extension .magnet
Read Only: No
Client Priority: Prioritize as you please
Tags: (optional) leave this blank unless you know how it works
Completed Download Handling: Remove Completed
```

:::

## Custom Prowlarr Debrid Indexers

:::info
If you are using the blackhole script, you can add as many public indexers as you like because blackhole will check each release for cache before adding it to your real-debrid account.
:::

:::tip
Setup Prowlarr as per usual and connect each *arr app to it under settings>apps.<br/> 
You will need the api keys for each *arr instance to do this.<br/>
We have created and compiled custom prowlarr indexers that search for cached torrents on RD.
:::

You can find them here:
[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=dreulavelle&repo=Prowlarr-Indexers&theme=dark)](https://github.com/dreulavelle/Prowlarr-Indexers)

## Petio
:::info
Petio is a request alternative to Overseerr that I use to help automate my library.
:::

:::tip
I utilise the ‘filters’ settings to tell Petio which instance of *arr to use and specify which root path to set a request, depending on the filters I make.<br/>
For instance, when an anime series is requested, I tell it to send it to sonarr anime and select the root path to set the series in, it can also do the same for kids’ shows/movies.<br/>
I have made a separate root path for “Movies - Kids” in Radarr and “TV - Kids in Sonarr” which I use to separate kids’ stuff from the rest.<br/>
Petio will automatically filter kids’ requests to this root path. 
:::

## Autoscan
[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=saltydk&repo=autoscan&theme=dark)](https://github.com/saltydk/autoscan)

:::info
Autoscan will push a scan to Plex/Jellyfin/Emby to only the folder of newly downloaded media when something is imported via *arrs.
:::

Here is my config:
```yaml
# <- processor ->

# Override the minimum age before a scan request is sent to the target (Default 10m):
minimum-age: 0m

# Override the delay between processed scans (Default 5s):
scan-delay: 5s

# override the interval scan stats are displayed (defaults to 1 hour / 0s to disable):
scan-stats: 1h

# Set anchor files for remote storage. If these are missing no scans will be sent to the target to avoid files being trashed when a mount fails
anchors:
  - /mnt/remote/realdebrid/version.txt

# <- triggers ->

# Optionally, protect your webhooks with authentication
authentication:
  username: user
  password: password

# Port for Autoscan webhooks to listen on
port: 3030

triggers:
  sonarr:
    - name: sonarr # /triggers/sonarr
      priority: 1
      
  radarr:
    - name: radarr # /triggers/radarr
      priority: 1

targets:
  plex:
    - url: https://plex.domain.xyz
      token: Insert Plex Token Here
  jellyfin:
    - url: https://jellyfin.domain.xyz
      token: Insert Jellyfin Token Here 
```

in each *arr instance you will need to add the following to `settings>connect>+>webhook:`

::: code-group

```python [radarr]
http://autoscan:3030/triggers/radarr
```

```python [sonarr]
http://autoscan:3030/triggers/sonarr
```

:::

:::tip
You can use the same `radarr` or `sonarr` endpoint in the multiple instances of *arrs
:::

## Extras/Scripts

Here is a repo of scripts I’ve collected to help maintain my real-debrid library.<br/>
[My Realdebrid Scripts Repo](https://github.com/Pukabyte/Real-Debrid-Scripts)

### Discard - (Created by @west.)

:::info
Make a backup before running this for the first time on [Debrid Media Manager](https://debridmediamanager.com)<br/>
Run with `--dry-run` eg. `python3 [discard.py](http://discard.py) --dry-run`<br/>
when you’re happy with it, run it with `--no-confirm` eg. `python3 discard.py --no-confirm`<br/>
I’ve set a cron to run this daily at midnight.
:::

:::tip
If `--dry-run` and `--no-confirm` are left out of false it'll prompt you for each folder if you'd like to delete it<br/>
If `--dry-run` is set it'll run through the whole process and just print which folders would've been deleted without deleting anything.<br/>
If `--no-confirm` is set it'll run through the whole process and delete all folders that are not symlinked.
:::

:::warning
Removes torrents from Real-Debrid that do not have a symlink attached to them.<br/>

- Change `path/to/debrid/mount` to the parent folder where all your links/symlinks point to.<br/>
- Change `path/to/symlinks` to the parent media (plex) folder where all your symlinks are.
:::

### Symclean
:::info
Rewrites symlinks if some were made using the old volume mapping method (/mount/torrents) to the new volume mapping method (/mnt/remote/realdebrid)<br/>
<br/>
- read the code and make the necessary changes as per needed for your use case.
:::

### Start/Stop/Restart
:::info
Runs the action for all the containers that access Zurg in case of failed order of start where zurg/rclone starts after the other containers on a reboot.<br/>
<br/>
- useful upon rebooting the server where docker containers are started randomly
:::

### Zurgupdate

This script will do the following
```
1. Stops all containers accessing zurg 
2. Cd into zurg directory, 
3. Compose zurg down, 
4. Prunes unused images, 
5. Prunes unused volume data, 
6. Docker compose up -d
7. Starts the stopped containers.
```

## Docker Stack 
:::info
This is only provided as an example of a docker stack.</br>
This may be out of date, and it is untested as is.
:::
```yaml
version: '3.8'

services:
  autoscan:
    container_name: autoscan
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 3030/tcp
    hostname: autoscan
    image: saltydk/autoscan:latest
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/autoscan:/config
    depends_on:
      - rclone
      - plex
      - radarr
      - sonarr

  petio:
    command:
      - node
      - petio.js
    container_name: petio
    ports:
      - 7777/tcp
    hostname: petio
    image: ghcr.io/petio-team/petio:latest
    restart: unless-stopped
    user: 1000:1000
    volumes:
      - /mnt:/mnt
      - /opt/petio:/app/api/config
    working_dir: /app
    depends_on:
      - radarr
      - sonarr
      - plex
 
  petio-mongo:
    command:
      - mongod
    container_name: petio-mongo
    ports:
      - 27017/tcp
    hostname: petio-mongo
    image: mongo:4.4
    restart: unless-stopped
    user: 1000:1000
    volumes:
      - /mnt:/mnt
      - /opt/petio/mongodb/config:/data/configdb
      - /opt/petio/mongodb:/data/db

  plex:
    container_name: plex
    devices:
      - /dev/dri:/dev/dri
    environment:
      - PLEX_UID=1000
      - PLEX_GID=1000
    ports:
      - 1900/udp
      - 32400/tcp
      - 32410/udp
      - 32412/udp
      - 32413/udp
      - 32414/udp
      - 32469/tcp
      - 8324/tcp
    hostname: plex
    image: plexinc/pms-docker:latest
    restart: unless-stopped
    volumes:
      - /dev/shm:/dev/shm
      - /mnt/local/transcodes/plex:/transcode
      - /mnt:/mnt
      - /opt/plex:/config
      - /opt/scripts:/scripts
    depends_on:
      - rclone

  prowlarr:
    container_name: prowlarr
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 9696/tcp
    hostname: prowlarr
    image: ghcr.io/hotio/prowlarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/prowlarr/Definitions/Custom:/Custom
      - /opt/prowlarr:/config

  radarr:
    container_name: radarr
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 7878/tcp
    hostname: radarr
    image: ghcr.io/hotio/radarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/radarr:/config
      - /opt/scripts:/scripts
      - /usr/bin/rclone:/usr/bin/rclone
    depends_on:
      - rclone

  radarr4k:
    container_name: radarr4k
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 7878/tcp
    hostname: radarr4k
    image: ghcr.io/hotio/radarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/radarr4k:/config
      - /opt/scripts:/scripts
      - /usr/bin/rclone:/usr/bin/rclone
    depends_on:
      - rclone

  radarr4kdv:
    container_name: radarr4kdv
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 7878/tcp
    hostname: radarr4kdv
    image: ghcr.io/hotio/radarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/radarr4kdv:/config
      - /opt/scripts:/scripts
      - /usr/bin/rclone:/usr/bin/rclone
    depends_on:
      - rclone

  radarranime:
    container_name: radarranime
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 7878/tcp
    hostname: radarranime
    image: ghcr.io/hotio/radarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/radarranime:/config
      - /opt/scripts:/scripts
      - /usr/bin/rclone:/usr/bin/rclone
    depends_on:
      - rclone
  
  blackhole:
    image: ghcr.io/westsurname/scripts/blackhole:latest
    container_name: blackhole
    user: "1000:1000"
    volumes:
      - ${REALDEBRID_MOUNT_TORRENTS_PATH:-/dev/null}:${REALDEBRID_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}:${TORBOX_MOUNT_TORRENTS_PATH:-/dev/null}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_SONARR_PATH}
      - ${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}:/${BLACKHOLE_BASE_WATCH_PATH}/${BLACKHOLE_RADARR_PATH}
      - ./logs:/app/logs
      - /mnt:/mnt
    env_file:
      - .env
    environment:
      - BLACKHOLE_BASE_WATCH_PATH=/${BLACKHOLE_BASE_WATCH_PATH}
      - PUID=1000
      - PGID=1000
      - UMASK=002
    restart: unless-stopped
    depends_on:
      - rclone

  sonarr:
    container_name: sonarr
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 8989/tcp
    hostname: sonarr
    image: ghcr.io/hotio/sonarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/scripts:/scripts
      - /opt/sonarr:/config
      - /usr/bin/rclone:/usr/bin/rclone
    depends_on:
      - rclone

  sonarr4k:
    container_name: sonarr4k
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 8989/tcp
    hostname: sonarr4k
    image: ghcr.io/hotio/sonarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/scripts:/scripts
      - /opt/sonarr4k:/config
      - /usr/bin/rclone:/usr/bin/rclone
    depends_on:
      - rclone

  sonarr4kdv:
    container_name: sonarr4kdv
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 8989/tcp
    hostname: sonarr4kdv
    image: ghcr.io/hotio/sonarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/scripts:/scripts
      - /opt/sonarr4kdv:/config
      - /usr/bin/rclone:/usr/bin/rclone
    depends_on:
      - rclone

  sonarranime:
    container_name: sonarranime
    environment:
      - PUID=1000
      - PGID=1000
    ports:
      - 8989/tcp
    hostname: sonarranime
    image: ghcr.io/hotio/sonarr:release
    restart: unless-stopped
    volumes:
      - /mnt:/mnt
      - /opt/scripts:/scripts
      - /opt/sonarranime:/config
      - /usr/bin/rclone:/usr/bin/rclone
    depends_on:
      - rclone

  zurg:
    image: ghcr.io/debridmediamanager/zurg-testing:v0.9.3-hotfix.11
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
    command: "mount zurg: /data --allow-non-empty --allow-other --uid=1000 --gid=1000 --dir-cache-time 10s"
```
