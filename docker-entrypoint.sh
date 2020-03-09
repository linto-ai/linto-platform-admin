#!/bin/bash
set -e
[ -z "$LINTO_STACK_DOMAIN" ] && {
    echo "Missing LINTO_STACK_DOMAIN"
    exit 1
}
[ -z "$LINTO_STACK_USE_SSL" ] && {
    echo "Missing LINTO_STACK_DOMAIN"
    exit 1
}

while [ "$1" != "" ]; do
    case $1 in
    --rebuild-vue-app)
        echo "REBUILDING VUE APP"
        if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
            echo "VUE_APP_URL=
            VUE_APP_NLU_URL=https://$LINTO_STACK_DOMAIN/tock
            VUE_APP_NODERED=https://$LINTO_STACK_DOMAIN/bls" >.env.production
        else
            echo "VUE_APP_URL=
            VUE_APP_NLU_URL=https://$LINTO_STACK_DOMAIN/tock
            VUE_APP_NODERED=https://$LINTO_STACK_DOMAIN/bls" >.env.production
        fi
        cd /usr/src/app/linto-admin/vue_app
        npm install &&
            npm install --save node-sass &&
            npm run build-app
        ;;
    --reinstall-webserver)
        echo "REBUILDING WEBSERVER APP"
        cd /usr/src/app/linto-admin/webserver
        npm install
        ;;
    --run-cmd)
        if [ "$2" ]; then
            script=$2
            shift
        else
            die 'ERROR: "--run-npm-script" requires a non-empty option argument.'
        fi
        ;;
    --run-cmd?*)
        script=${1#*=} # Deletes everything up to "=" and assigns the remainder.
        ;;
    --run-cmd=) # Handle the case of an empty --run-cmd=
        die 'ERROR: "--run-cmd" requires a non-empty option argument.'
        ;;
    *)
        echo "ERROR: Bad argument provided \"$1\""
        exit 1
        ;;
    esac
    shift
done

echo "RUNNING : $script"
cd /usr/src/app/linto-admin/webserver
eval "$script"


#exec "$@"