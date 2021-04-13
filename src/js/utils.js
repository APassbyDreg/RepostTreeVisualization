/**
 * 
 * @param {RepoNode[]} nodes 
 * @returns {number} maxEssDepth
 */
function maxEssDepth(nodes) {
    var maxdepth = 1;
    for (var p = 0; p < nodes.length; p++) {
        if (nodes[p].type == "essential") {
            maxdepth = Math.max(maxdepth, nodes[p].depth);
        }
    }
    return maxdepth + 1;
}

/**
 * 
 * @param {RepoNode[]} nodes 
 * @returns {number} totalTimestamp
 */
function totalTimestamp(nodes) {
    var total_ts = 0;
    for (var p = 0; p < nodes.length; p++) {
        total_ts = Math.max(total_ts, nodes[p].time);
    }
    return total_ts + 1;
}

/**
 * convert node list to time table
 * @param {RepoNode[]} followings 
 * @param {number} max_ts 
 */
function toFolTable(followings, max_ts) {
    let timeline = new Array(max_ts);
    for (let p = 0; p < timeline.length; p++) {
        timeline[p] = { 'level': 0, 'nodes': [] };
    }
    for (let p = 0; p < followings.length; p++) {
        const element = followings[p];
        timeline[element.time]['nodes'].push(element);
        timeline[element.time]['level'] += element.depth;
    }
    for (let p = 0; p < timeline.length; p++) {
        if (timeline[p]['nodes'].length > 0) {
            timeline[p]['level'] /= timeline[p]['nodes'].length;
        }
    }
    return timeline;
}


/**
 * 
 * @param {RepoNode[]} nodes 
 */
function toEssTable(nodes, num_ess, ess_depth) {
    let ess_table = new Array(num_ess + 1).fill(0).map(() => new Array(ess_depth).fill(0));
    for (let r = 0; r < num_ess + 1; r++) {
        for (let c = 0; c < ess_depth; c++) {
            ess_table[r][c] = { 'parent': null, 'node': null }
        }
    }

    // let ess_list = [nodes[0]];
    // ess_table[0][0]['node'] = nodes[0];
    // ess_table[0][0]['parent'] = null;
    // let stk = [[nodes[0], null]];
    // let p = 1;
    // while (p < num_ess + 1) {
    //     let curr = stk.pop();
    //     for (let index = 0; index < curr[0].children.length; index++) {
    //         if (curr[0].children[index].type == "essential") {
    //             let node = curr[0].children[index];
    //             let parent = [p - 1, curr[0].depth];
    //             ess_table[p][curr[0].depth+1]['node'] = node;
    //             ess_table[p][curr[0].depth+1]['parent'] = parent;
    //             ess_list.push(node);
    //             stk.push([node, parent]);
    //             p += 1;
    //         }
    //     }
    // }
    let ess_list = []
    let p = 0;
    function dfs(curr, depth, parent) {
        ess_list.push(curr);
        let currPos = [p, depth];
        ess_table[p][depth]['node'] = curr;
        ess_table[p][depth]['parent'] = parent;
        p += 1;
        for (let index = 0; index < curr.children.length; index++) {
            if (curr.children[index].type == "essential") {
                let nxt = curr.children[index];
                dfs(nxt, depth+1, currPos);
            }
        }
    }
    
    dfs(nodes[0], 0, [0, 0]);


    return [ess_table, ess_list];
}


/**
 * 
 * @param {number[]} p1 
 * @param {number[]} p2
 * @param {string} color
 * @param {number} width
 */
function drawLine(p1, p2, color = "#ccccee", width = 2) {
    return {
        "x1": p1[0],
        "y1": p1[1],
        "x2": p2[0],
        "y2": p2[1],
        "style": `stroke: ${color}; stroke-width: ${width};`
    }
}

/**
 * 
 * @param {string} queryStr
 * @param {string} parentID
 */
function getRelativeCenter(queryStr, parentID) {
    let parentBBox = document.getElementById(parentID).getBoundingClientRect();
    let elemBBox = document.querySelector(queryStr).getBoundingClientRect();
    return [
        elemBBox.x - parentBBox.x + elemBBox.width / 2,
        elemBBox.y - parentBBox.y + elemBBox.height / 2
    ];
}

/**
 * 
 * @param {RepoNode[]} followings 
 * @returns index of the first non-empty following cell
 */
function firstFol(followings) {
    for (let index = 0; index < followings.length; index++) {
        const element = followings[index];
        if (element.nodes.length > 0) return index;
    }
    return followings.length - 1;
}


/**
 * https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
 * @param {*} exportObj 
 * @param {string} exportName 
 */
function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}