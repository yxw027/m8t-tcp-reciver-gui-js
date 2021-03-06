import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import NtripClient from '../../components/NtripClient';
import SignalCellularAlt from '@material-ui/icons/SignalCellularAlt';

import { NTRIP_CLIENT_DEF as userConfig } from '../../../../user-config';

/* Migrate to React hooks" */
import useReactRouter from 'use-react-router';
import { MobXProviderContext } from 'mobx-react';
function useStores() {
    return React.useContext(MobXProviderContext);
}
////////////////////////////

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 'auto'
    }
}));

const icons = {
    main: SignalCellularAlt
};

const routeInfo = {
    path: '/corrections',
    name: 'corrections'
};

const CorrectionsView = observer(props => {
    const classes = useStyles();
    const theme = useTheme();

    const { history, location, match } = useReactRouter();
    const { apiStore } = useStores();

    const ntripConnInfo = userConfig;
    let localStorage = (window && window.localStorage) ?  window.localStorage : null;

    const handlerNtripConnect = async ntripOptions => {
        const res = apiStore.ntripAction(true, ntripOptions);
        apiStore.updateNtripState();
        if (!localStorage) {
            console.warn('localStorage is null');
        } else if (res && res.data && res.data.enabled) {
            const json = JSON.stringify(state.ntripClient);
            localStorage.setItem('ntripClient', json);
        }
    };
    const handlerNtripDisconnect = async ntripOptions => {
        apiStore.ntripAction(false, ntripOptions);
        //apiStore.updateNtripState();
    };

    const componentDidMount = () => {
        apiStore.updateNtripState();
        if (!localStorage) {
            console.warn('localStorage is null');
        } else {
            const json = localStorage.getItem('ntripClient');
            console.debug({ json });
            if (json) {
                try {
                    ntripConnInfo = JSON.parse(json);
                    console.debug({ connectionInfo: ntripConnInfo });
                } catch (err) {
                    console.warn(err);
                }
            }
            if (!ntripConnInfo) {
                ntripConnInfo = userConfig;
            }
        }
    };

    React.useEffect(() => {
        console.info('CorrectionsView useEffect START');
        componentDidMount();
        return () => {
            console.info('CorrectionsView useEffect STOP');
        };
    }, []);

    console.debug({ NTRIP: apiStore.ntripState.enabled });
    return (
        <div className={classes.root}>
            <NtripClient
                connected={apiStore.ntripState.enabled}
                open={true}
                handleConnect={handlerNtripConnect}
                handleDisconnect={handlerNtripDisconnect}
                connectionInfo={ntripConnInfo}
            />
        </div>
    );
});

export default CorrectionsView;
export { routeInfo, icons };
