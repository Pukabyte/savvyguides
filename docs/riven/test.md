---
hide:
  - navigation
---

<div align="center">
    <a href="https://github.com/rivenmedia/riven">
        <picture>
            <img
                alt="Riven"
                src="https://raw.githubusercontent.com/rivenmedia/wiki/refs/heads/main/docs/images/logo.png"
            ></img>
        </picture>
    </a>
</div>

<div align="center">
    <a
        href="https://github.com/rivenmedia/riven/stargazers"
        style="display: inline-block; margin-right: 10px;"
    >
        <img
            src="https://img.shields.io/github/stars/rivenmedia/riven"
            alt="GitHub Stars"
        />
    </a>
    <a
        href="https://github.com/rivenmedia/riven/issues"
        style="display: inline-block; margin-right: 10px;"
    >
        <img
            alt="Issues"
            src="https://img.shields.io/github/issues/rivenmedia/riven"
        />
    </a>
    <a
        href="https://github.com/rivenmedia/riven/blob/main/LICENSE"
        style="display: inline-block; margin-right: 10px;"
    >
        <img
            alt="License"
            src="https://img.shields.io/github/license/rivenmedia/riven"
        />
    </a>
    <a
        href="https://github.com/rivenmedia/riven/graphs/contributors"
        style="display: inline-block; margin-right: 10px;"
    >
        <img
            alt="Contributors"
            src="https://img.shields.io/github/contributors/rivenmedia/riven"
        />
    </a>
    <a href="https://discord.gg/rivenmedia" style="display: inline-block;">
        <img
            alt="Discord"
            src="https://img.shields.io/badge/Join%20discord-8A2BE2"
        />
    </a>
</div>


::: tip "Riven"
    **Riven** is a powerful media management and streaming solution designed to integrate with various media servers and third-party services.
    It automates the process of finding, downloading, and organizing media content, making it instantly available for streaming through your preferred media server.
:::
<div class="grid cards" markdown="1" style="justify-content: center;" id="home-cards">

-   :gear: __Easy Installation__

    ---

    Get Riven up and running quickly with our comprehensive installation guide. Whether you're using Docker or running natively, we've got you covered.

    [:gear: Installation Guide](#installation)

-   :wrench: __Powerful Configuration__

    ---

    Customize Riven to fit your media management needs. Configure debrid services, media servers, and more with our user-friendly interface.

    [:wrench: Configuration Options](#configuration)

-   :cloud: __ElfHosted ❤️__

    ---

    [ElfHosted](https://elfhosted.com) is a PaaS that takes care of all the technical details like hosting, security, and updates for your self-hosted apps.

    - :party_popper: **Sponsored**: Your subscription goes directly to Riven developers!

    [:cloud: Check out ElfHosted](#elfhosted)

-   :fontawesome-brands-discord: __Active Community__

    ---

    Join our vibrant community for support, updates, and contributions. Collaborate with other users and developers to make Riven even better.

    [:fontawesome-brands-discord: Join the Discord](https://discord.gg/rivenmedia)

</div>

---

# Getting Started

![step-5](/images/onboard/final.png)

::: warning "**Beta**"
    Riven is under active development, we are constantly working on new features and fixing bugs.
:::

Riven streamlines your media consumption experience by:

1. Automatically discovering new content based on your preferences and watchlists.
2. Efficiently searching for and downloading high-quality media files.
3. Organizing your media library using a smart symlink system.
4. Seamlessly integrating with your chosen media server for immediate streaming access.
5. Providing a user-friendly web interface for easy management and configuration.

Whether you're a casual viewer or a media enthusiast, Riven offers a powerful, automated solution to keep your media library up-to-date and easily accessible.

---
## <img src="https://elfhosted.com/images/logo.svg" width="100"> ElfHosted

[ElfHosted](https://elfhosted.com) is a geeky [open-source](https://elfhosted.com/open/) PaaS which provides all the "plumbing" (_hosting, security, updates, etc_) for your self-hosted apps.

**Curious how it works? Here's an [explainer video](https://www.youtube.com/watch?v=ZHZAEhLuJqk)!** :fire:

:::important "**ElfHosted ❤️ Riven 100%**"

    [Riven](https://elfhosted.com/app/riven/) is an "Elf-icial" app in the [ElfHosted app catalogue](https://elfhosted.com/apps/) - A whopping 100% of your subscription goes directly to Riven developers, who can usually be found in the [#elf-riven](https://discord.com/channels/396055506072109067/1253110932062601276) channel in the [ElfHosted Discord Server](https://discord.elfhosted.com).
:::

::: tip "ElfHosted "Infinite Streaming" bundles"
:::
    Riven comes pre-packaged with Zurg and your choice of Plex, Jellyfin, or Emby, and is available in the following convenient bundles:

    * [Starter Kit](https://store.elfhosted.com/product-category/streaming-bundles/starter) (*quick and easy setup*)
    * [Hobbit Bundle](https://store.elfhosted.com/product-category/streaming-bundles/hobbit) (*12.5% dedicated node, GPU transcoding, 250Mbps shared, extra bundled apps, 22% off non-bundled*)
    * [Ranger Bundle](https://store.elfhosted.com/product-category/streaming-bundles/ranger) (*25% dedicated node, GPU transcoding, 500Mbps shared, extra bundled apps, 44% off non-bundled*)
    * [Halfling Bundle](https://store.elfhosted.com/product-category/streaming-bundles/halfling) (*50% dedicated node, GPU transcoding, 1Gbps shared, extra bundled apps, 66% off non-bundled*)
    * [Nazgul Bundle](https://store.elfhosted.com/product-category/streaming-bundles/nazgul) (*100% dedicated node, GPU transcoding, 1Gbps dedicated, extra bundled apps, 88% off non-bundled*)

---

## Setup

Before we begin, we need to set up the required folders and files for Riven.

Grab the `docker-compose.yml` file from the [installation guide](#installation) and then `docker-compose up -d` to start the services.

::: note
    * **Linux**: Riven only supports Linux-based operating systems.
    * **Windows**: Riven only supports Windows Subsystem for Linux (WSL) in Windows.
    * **Rclone**: Required to mount debrid service. Additionally, Zurg is preferred for Real-Debrid users. [Learn more](https://rclone.org/)
    * **Media Server**: Plex, Jellyfin, and Emby are supported.
    * **Docker**: Required to run Riven in a containerized environment. [Learn more](https://www.docker.com/)
:::
::: tip "Debrid Support"
    Currently only **Real-Debrid**, **All-Debrid** and **Torbox** are supported. More
    services will be added in the future!
:::
---

### Setup Directories

For detailed information on the various services and configurations available in Riven, please refer to the [symlink](services/symlink/index.md) page. This page will help you understand how to configure and manage your media library using symlinks. It will help you understand why we map the Riven volumes to `/mnt` and how you can modify this in the `docker-compose.yml` file for the best outcome.

---

## Installation

::: danger "Setup Rclone & Symlink Paths First! :fire:"
:::

This is incredibly important and must be setup first! When configuring the rclone mount path and library path, you need to make sure that the paths are correct for your system. More information can be found at the [symlink](services/symlink/index.md) page.

If your debrid files are found in your rclone path, and you can successfully `ls -lh /mnt/zurg` your rclone path, you can skip this step.

`docker-compose.yml` file is used to run Riven in a containerized environment. It consists of three services:

1. `riven`: The main application (backend).
2. `riven-frontend`: The web interface (frontend).
3. `riven-db`: The database.

```yml title="docker-compose.yml"
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
            - TZ=America/New_York
            - ORIGIN=http://localhost:3000
            - BACKEND_URL=http://riven:8080
            - DIALECT=postgres
            - DATABASE_URL=postgres://postgres:postgres@riven-db/riven
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

Now this won't work as is, you need to modify the `docker-compose.yml` file to match your setup.

1. Change `TZ` to your timezone.
2. Change `ORIGIN` to the URL you will be accessing the web interface from. For example, if you are planning to run Riven on `https://riven.example.com`,
   change it to `https://riven.example.com`. This is not required if you are running riven behind a reverse proxy like `nginx`, `caddy`, `cosmos` etc.
3. Change `BACKEND_URL` to the URL where the frontend can access the backend. This is not required here as we are running both frontend and backend in the same network (stack).
4. Change `RIVEN_DATABASE_HOST` to the URL where the backend can access the database. This is not required here as we are running both backend and database in the same network (stack).
5. Change `DIALECT` and `DATABASE_URL` to use the same database as the backend. This is not required here as we are running both backend and database in the same network (stack).
6. Change `volumes` to match your setup. Riven requires access to the library folder and rclone mount path.

---

## Running Riven

Depending on how you installed Riven, execute the following command:

:::code-group

```bash [Docker]
docker-compose up -d && docker-compose logs -f
```
```bash [Local]
poetry install --without dev
poetry run python /src/main.py
```
:::
::: warning "Python Version"
    Riven requires Python 3.11 or higher and `poetry` to be installed.
:::
You can access the Riven web interface by navigating to the specified `ORIGIN` URL you entered in the `docker-compose.yml` file or your reverse proxy URL.

- Example: `http://localhost:3000`

--- 

## Configuration

Once Riven is running, you can configure it by accessing the web interface. You will be prompted with onboarding steps to set up your debrid service, media server, content services and scraper services.

There are 4 steps in the onboarding process.

### **Step 1**: General Settings

In this step you configure the downloaders (debrid services), rclone mount path, library path, subtitles, etc. See the image below for an example.

![step-1](/images/onboard/step1.png)

---

### **Step 2**: Media Server

In this step you configure the media server and updater settings. See the image below for an example.

![step-2](/images/onboard/step2.png)

---

### **Step 3**: Content Services

In this step you configure the content services like Trakt, Overseerr, etc. See the image below for an example.

![step-3](/images/onboard/step3.png)

---

### **Step 4**: Scraper Services

In this step you configure the scraper services like Torrentio, Zilean, Prowlarr, Jackett, etc. See the image below for an example.

![step-4](/images/onboard/step4.png)

---

**Done!**

Once you have completed the onboarding process, you will be greeted with a beautiful dashboard where you can manage your media library, request items, settings and many more in the future.

![step-5](/images/onboard/final.png)

At this point you can take a look at the [services](services/index.md) page to learn more about the various services and how to configure them.

---

## Frequently Asked Questions

!!! warning "Cross-site POST form submissions are forbidden"
    The most common reason for this is that you may not have set up `ORIGIN`
    correctly in the `docker-compose.yml` file. If you are running Riven
    behind a reverse proxy, you can remove the `ORIGIN` environment variable
    from the `riven-frontend` service.

!!! warning "I am seeing an error when trying to save changes"
    If you are seeing an error when trying to save changes, it is most likely due to incorrect configuration or backend failure. Please check the logs of the Riven service to see the error message. If you are unable to resolve the issue, feel free to ask for help in the Riven Discord server.

!!! warning "I am stuck in an onboarding loop"
    If you are stuck in the onboarding loop, it is most likely due to incorrect symlink settings. Check your library path and rclone mount path. If they are correct, check the logs of the Riven service. If you are unable to resolve the issue, feel free to ask for help in the Riven Discord server.