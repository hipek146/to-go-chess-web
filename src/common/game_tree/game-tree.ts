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
            const sameFENNode = this.leaf.getChildren().filter(el => el.positionFEN === positionFEN);
            if (sameFENNode.length !== 0) {
                this.leaf = sameFENNode[0];
                return sameFENNode[0];
            }
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
        if (node.move !== undefined) {
            result.push(node);
        }
        for(const child of node.getChildren()) {
            let branchResult = [];
            if (child !== node.getMainChild()) {
                this.traverse(child, branchResult);
            }
            if (branchResult.length !== 0) {
                result.push(branchResult);
            }
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
