import TreeNode from './tree-node';

class GameTree {
    root: TreeNode = undefined;
    leaf: TreeNode = undefined;
    
    constructor(positionFEN: string) {
        this.addMove(undefined, positionFEN);
    }

    addMove = (move: string, positionFEN: string) => {
        let node = new TreeNode(move, positionFEN);
        if (this.leaf === undefined && this.root === undefined) {
            this.root = node;
            this.leaf = node;
        } else {
            node.addParent(this.leaf);
            this.leaf.addChild(node);
            this.leaf = node;
        }
        return node;
     }

    setLeaf = (leaf: TreeNode) => {
        this.leaf = leaf;
    }

    getChild = () => {
        return this.leaf.getMainChild();
    }

    getParent = () => {
        return this.leaf.getParent();
    }

    setMainRoute = (node: TreeNode) => {
        let mainChild = node;
        for(let parent = node.getParent(); parent !== undefined; parent = parent.getParent()) {
            if (parent.getMainChild() !== mainChild) {
                parent.setMainChild(mainChild);
                return;
            }
            mainChild = parent;
        }
    }

    traverse = (node: TreeNode, result = []) => {
        if (node === undefined) return;
        let branchResult = [];
        for(const child of node.getChildren()) {
            if (child !== node.getMainChild()) {
                this.traverse(child, branchResult);
            }
        }
        if (node.move !== undefined) {
            result.push({
                move: node.move,
                positionFEN: node.positionFEN
            });
        }
        if (branchResult.length !== 0) {
            result.push(branchResult);
        }
        this.traverse(node.getMainChild(), result);
    }

    toSerializable = () => {
        let result = [];
        this.traverse(this.root, result);
        return result;
    }
}

export default GameTree;
