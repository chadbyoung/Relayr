<<<<<<< HEAD
# redis-snap

This is snap for Redis, the popular data store.

## Building

With Ubuntu 16.04 and snapcraft:

```
git clone https://github.com/markshuttle/redis-snap
cd redis-snap
snapcraft
```

The snap will be redis_version+git_amd64.snap in that directory.

Unless you have setup snapcraft signing keys, install with
`sudo snap install --force-dangerous <name>.snap` which bypasses
the requirement for a signature.

An official stable build of this snap will in due course be available from
the store as `snap install redis`.

## Once installed

Redis will try to start on boot, looking for configuration files in
/var/snap/redis/common/\*.conf and starting the databases described in
those.

A default config can be installed with `sudo redis.init`. Once the
system is running you can manage the daemon with
`sudo service snap.redis.launch start|stop|status`.

=======
# Relayr Edge Agent Snap  
This REPO holds code that is intended for development of a Relayr Edge Agent snap  

### Code Status = In Development

-------------------------------------------------------------------------------

### Use of the software:  
The applications and/or scripts in this github account are meant to be used as
a reference on how-to create snaps for Ubuntu Core. DO NOT USE this code in a
production environment. As with anything you find on the internet please proceed
with caution as you never know when Gremlins, Trolls, or Goblins will appear.  

If you have any question or comments, please email <chad.young@dell.com>  

-------------------------------------------------------------------------------
>>>>>>> 4a046d4acc8f67111577fe779630804aec0bd548
