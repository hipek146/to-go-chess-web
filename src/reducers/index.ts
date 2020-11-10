import {combineReducers} from 'redux';

const initialApp = {
    isSignout: false,
    user: null,
};

const app = (state = initialApp, action: any) => {
    switch (action.type) {
        case 'RESTORE_USER':
            return {
                ...state,
                user: action.user,
            };
        default:
            return state;
    }
};



export default combineReducers({
    app
});
