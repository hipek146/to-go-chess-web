import {combineReducers} from 'redux';

const initialApp = {
    isSignout: false,
    user: null,
    dialog: {}
};

const app = (state = initialApp, action: any) => {
    switch (action.type) {
        case 'GAME_TREE_UPDATED':
            return {
                ...state,
                gameTree: action.gameTree
            }
        case 'RESTORE_USER':
            return {
                ...state,
                user: action.user,
            };
        case 'OPEN_DIALOG':
            return {
                ...state,
                dialog: {
                    content: action.content,
                    onClose: action.onClose,
                },
            }
        case 'CLOSE_DIALOG':
            return {
                ...state,
                dialog: {},
            }
        case 'NEW_GAME':
            return {
                ...state,
                config: action.config,
                newGame: true,
            }
        case 'GAME_CREATED':
            return {
                ...state,
                newGame: false,
            }
        default:
            return state;
    }
};



export default combineReducers({
    app
});
