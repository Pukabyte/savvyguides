# A Sailarr’s Guide to Plex + Real-Debrid


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/davyjonesmedia/tip)

::: tip
👋🏼 If you need any assistance with this come find me on discord ***@thebropuks***
You can also visit the kometa discord for additional configs and support. [Kometa Discord](https://kometa.wiki/en/latest/discord/)
:::

:::info ⭐ Special Mentions


:::

### Notifiarr is a purpose built system to bring many applications together to manage and customize notifications via Discord. You can monitor many aspects of your network(s).
:::info
This guide will focus on setting up notifiarr & notifiarr client to achieve trash guides custom format syncing.
:::

### Prerequisites

- Sonarr / Radarr
- A one time payment to receieve access to the trash guides integration
- basic Docker knowledge
- Portainer (optional, but recommended)

### Starting off
    
First, create an account with [Notifiarr](https://notifiarr.com/)
Navigate to [Support Project](https://notifiarr.com/sponsor.php) and make a one-time payment of at least $3 to gain access to the trash guides integration. 
 


## Notifiarr client setup
:::info
We are now going to start the notifiarr client to integrated sonarr / radarr to notifiarr.
:::

Add the notifiarr client to your pre-existing stack, or create a new one and compose up the client.

```yaml
services:
  notifiarr:
    container_name: notifiarr
    hostname: notifiarr
    image: golift/notifiarr
    restart: unless-stopped
    ports:
      - "5454:5454"
    volumes:
      - /opt/notifiarr:/config
      - /var/run/utmp:/var/run/utmp
      - /etc/machine-id:/etc/machine-id
```

Then navigate to your config file location (/opt/notifiarr/) and add your API key to the config.
You can find your API key [here](https://notifiarr.com/user.php?page=profile), using your global key.
You should also see a field to change your username and password. Set those as well

```
## This API key must be copied
from your notifiarr.com account.
api_key = "api-key-from-notifiarr.com"
```


Now, start the container. The config will be encrypted from here on, and will need to be further configured from inside the client's webUI.


## Configuring Notifiarr client
Navigate to the client (default port: 5454) and login.
Click on "Starr Apps" in the sidebar and configure your instances as seen below.
<div align="center">
    <img style="padding: 100;" src="https://cdn.discordapp.com/attachments/1314331222058467359/1327433834312110153/image.png?ex=67830c98&is=6781bb18&hm=d79cd085c7c7210c232a8a1754b2487673cecf5c62b2a140ad8fdc3809e62959&"/></a>
</div>
Once you have populated all the required fields, make sure you hit "Save & Reload" at the bottom of the sidebar.

<div align="center">
    <img style="padding: 100;" src="https://cdn.discordapp.com/attachments/1314331222058467359/1327434423104438393/image.png?ex=67830d25&is=6781bba5&hm=b3d0139d13f41741e2d4dff761ab00fe22cb795d346f9f53eb40c4a18ace05ae&"/></a>
</div>

## Enabling Trash Guides integration
:::info
You should now see the notifiarr client connected in notifiarr's dashboard with sonarr & radarr icons next to the client.
:::

Click on the cog of the "Add/Remove Integrations" section and scroll down to find and enable Trash Guides sync.
<div align="center">
    <img style="padding: 100;" src="https://cdn.discordapp.com/attachments/1314331222058467359/1327434813849862256/image.png?ex=67830d82&is=6781bc02&hm=bea77bcd67d85f023417e53df07a5baf8bb291c6446268653b8f5de6442f1af1&"/></a>
</div>

Scroll all the way down and save your progress.
<div align="center">
    <img style="padding: 100;" src="https://cdn.discordapp.com/attachments/1314331222058467359/1327434983664652402/image.png?ex=67830daa&is=6781bc2a&hm=4873d79e8509b75a5d75fbaf2aade820f680a819b9ce55fd01b5f4e02ffbdb93&"/></a>
</div>

## Configuring Formats

Now, back on the integration setup page you will see the Trash Guides integration. Click on the cog to enter the settings menu.

<div align="center">
    <img style="padding: 100;" src="https://cdn.discordapp.com/attachments/1314331222058467359/1327435202066382920/image.png?ex=67830dde&is=6781bc5e&hm=5b867f3bd121dff1729a1b4b8e16e132305f7763084cee73dedd2ebad7819bfb&"/></a>
</div>

You will be presented with a table of custom formats. You can scroll down or click on one of the formats to be presented with a list of each custom format type. 

<div align="center">
    <img style="margin: 15px;" src="https://cdn.discordapp.com/attachments/1314331222058467359/1327437409180319807/image.png?ex=67830fec&is=6781be6c&hm=7094a7272a052c76d256048459baebfeac43122e0fa8032489fbaf50395ea588&"/></a>
</div>


From here it's up to you to determine what formats you will need. For example, if you are using anime, expand each anime format related format and sync them to the desired instance. 
:::info
You can view the quality profiles [here](https://trash-guides.info/Sonarr/sonarr-setup-quality-profiles/#trash-quality-profiles) to get an idea of what you might want in each instance. 
:::

<div align="center" style="margin-top: 15px; margin-bottom: 15px;">
    <img src="https://cdn.discordapp.com/attachments/1314331222058467359/1327431307378163803/image.png?ex=67830a3e&is=6781b8be&hm=9bd91af0012f3d38a751d1fb55af3cd8fb6fbdcd2112712aed2823df23ce3332&"/></a>
</div>


