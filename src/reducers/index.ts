import {combineReducers} from 'redux';

const initialApp = {
    isSignout: false,
    user: null,
    dialog: {},
    toast: {},
};

const app = (state = initialApp, action: any) => {
    switch (action.type) {
        case 'GAME_TREE_UPDATED':
            return {
                ...state,
                gameTree: action.gameTree
            }
        case 'GAME_OBJECT_CREATED':
            return {
                ...state,
                game: action.game
            }
        case 'TREE_MOVEMENT_ENABLED':
            return {
                ...state,
                isTreeEnabled: true
            };
        case 'TREE_MOVEMENT_DISABLED':
            return {
                ...state,
                isTreeEnabled: false
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
        case 'OPEN_TOAST':
            return {
                ...state,
                toast: {
                    content: action.content
                },
            }
        case 'CLOSE_TOAST':
            return {
                ...state,
                toast: {},
            }
        case 'NEW_GAME':
            return {
                ...state,
                config: action.config,
                status: 'inProgress',
                newGame: true,
                componentType: 'game'
            }
        case 'GAME_CREATED':
            return {
                ...state,
                newGame: false,
            }
        case 'NEW_ANALYSIS':
            return {
                ...state,
                newAnalysis: true,
                movesPGN: action.movesPGN,
                componentType: 'analysis'
            }
        case 'ANALYSIS_CREATED':
            return {
                ...state,
                newAnalysis: false,
                movesPGN: undefined
            }
        case 'DRAW_OFFERED':
            return {
            ...state,
            status: 'drawOffered',
        }
        case 'SURRENDERED':
            return {
                ...state,
                status: 'surrendered',
            }
        case 'GAME_IN_PROGRESS':
            return {
                ...state,
                status: 'inProgress',
            }
        default:
            return state;
    }
};



export default combineReducers({
    app
});
