class RepoNode {
    constructor(idx, time, n_fans=0, type="normal") {
        // info
        this.idx = idx;
        this.time = time;
        this.n_fans = n_fans;
        
        // structure related
        this.parent = null;
        this.children = [];

        // computation related
        this.type = type;
        this.depth = null;
        this.following = null;
    }
}

/**
 * set depth for current and following nodes
 * @param {RepoNode} curr 
 * @param {number} depth 
 */
function markDepth(curr, depth) {
    curr.depth = depth;
    for (var p=0; p<curr.children.length; p++) {
        markDepth(curr.children[p], depth+1);
    }
}

/**
 * set following for current and following nodes
 * @param {RepoNode} curr
 * @returns {number} number of following nodes 
 */
function markFollowing(curr) {
    let total = 0;
    for (var p=0; p<curr.children.length; p++) {
        total += markFollowing(curr.children[p]);
    }
    curr.following = total;
    return total + 1;
}

/**
 * mark essential nodes and normal nodes by given num_ess
 * @param {RepoNode[]} nodes 
 * @param {number} num_ess 
 */
function markEssentials(nodes, num_ess) {
    nodes.sort((a, b) => { return b.following - a.following; });
    for (var p=1; p<nodes.length; p++) {
        if (p <= num_ess) {
            nodes[p].type = "essential";
        }
        else {
            nodes[p].type = "noremal";
        }
    }
    return nodes;
}

/**
 * return list of following nodes
 * @param {RepoNode} curr 
 * @returns {RepoNode[]} following nodes;
 */
function getFollowings(curr, exclude_ess=false, only_ess=false) {
    let nodes = [];
    // nodes = nodes.concat(curr.children);
    for (var p=0; p<curr.children.length; p++) {
        if (only_ess) {
            if (curr.children[p].type == "essential") {
                nodes.push(curr.children[p]);
                nodes = nodes.concat(getFollowings(curr.children[p], false, only_ess));
            }
        }
        else if (!(exclude_ess && curr.children[p].type == "essential")) {
            nodes.push(curr.children[p]);
            nodes = nodes.concat(getFollowings(curr.children[p], exclude_ess, false));
        } 
    }
    return nodes;
}

/**
 * generate repo tree
 * @param {dictionary} data 
 * @returns {RepoNode[]} root node of a tree
 */
function createRepoTree(data, num_ess=5) {
    let nodes = [];
    for (var p=0; p<data.length; p++) {
        let info = data[p];
        var node = new RepoNode(info["idx"], info["timestamp"], info["fans"]);
        if (info["parent"] != null) {
            node.parent = nodes[info["parent"]];
            nodes[info["parent"]].children.push(node);
        }
        nodes.push(node);
    }
    markDepth(nodes[0], 0);
    markFollowing(nodes[0]);
    markEssentials(nodes, num_ess);
    nodes[0].type = "root";
    return nodes;
}