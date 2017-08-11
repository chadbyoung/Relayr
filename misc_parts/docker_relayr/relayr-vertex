#! /bin/sh
### BEGIN INIT INFO
# Provides:             relayr-vertex
# Required-Start:       redis-server
# Required-Stop:
# Should-Start:         $local_fs
# Should-Stop:          $local_fs
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    Starts relayr vertex daemon on port 1833
# Description:          Starts relayr vertex daemon on port 1833
### END INIT INFO


PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/bin/node
DAEMON_ARGS=/usr/bin/vertex
NAME=relayr-vertex
DESC=relayr-vertex
PIDFILE=/var/run/relayr-vertex.pid
VERTEX_CONFIG_FILE=/etc/vertex/config
IOX_INI_FILE=/data/package_config.ini
RELAYR_BEARER_TOKEN=`awk -F'=' '/RELAYR_BEARER_TOKEN/ {print $2}' $IOX_INI_FILE`
RELAYR_VERTEX_NAME=`awk -F'=' '/RELAYR_VERTEX_NAME/ {print $2}' $IOX_INI_FILE`
RELAYR_VERTEX_LOCATION=`awk -F'=' '/RELAYR_VERTEX_LOCATION/ {print $2}' $IOX_INI_FILE`
RELAYR_VERTEX_CONFIGURE_OUTPUT_FILE=/etc/vertex/vertex_configure_output.log

test -x $DAEMON || exit 0
test -x $DAEMONBOOTSTRAP || exit 0


set -e

case "$1" in
  start)
        echo -n "Starting $DESC: "
        touch $PIDFILE
        chown root:root $PIDFILE
        # Run vertex-configure if running for the first time (i.e. vertex config file does not exist)
        if [ -f $VERTEX_CONFIG_FILE ]
        then
                echo "Found vertex configuration, launching vertex with /etc/vertex/config"
        else
                echo "Running Vertex for the first time, running vertex-configure first"
                if /usr/bin/vertex-configure "$RELAYR_VERTEX_NAME" "$RELAYR_VERTEX_LOCATION" "$RELAYR_BEARER_TOKEN" >>$RELAYR_VERTEX_CONFIGURE_OUTPUT_FILE
                then
                        echo /usr/bin/vertex-configure "$RELAYR_VERTEX_NAME" "$RELAYR_VERTEX_LOCATION" "$RELAYR_BEARER_TOKEN"
                        echo "Completed vertex-configure successfully, vertex config in /etc/vertex/config"
                else
                        echo "vertex-configure failed, try manual run"
                fi
        fi
        if start-stop-daemon --start --background --quiet --pidfile $PIDFILE --chuid root:root --exec $DAEMON -- $DAEMON_ARGS
        then
                echo "Started $NAME."
        else
                echo "failed"
        fi
        ;;
  stop)
        echo -n "Stopping $DESC: "
        if start-stop-daemon --stop --retry 10 --quiet --oknodo --pidfile $PIDFILE --exec $DAEMON
        then
                echo "$NAME."
        else
                echo "failed"
        fi
        rm -f $PIDFILE
        ;;

  restart|force-reload)
        ${0} stop
        ${0} start
        ;;
  *)
        echo "Usage: /etc/init.d/$NAME {start|stop|restart|force-reload}" >&2
        exit 1
        ;;
esac

exit 0
