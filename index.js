const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

let shift = 0;
let freeRow = 0;
const branches = {};

const COMMIT_R = 8;
const COMMIT_SPAN = 50;
const BRANCH_SPAN = 30;
const LINE_WIDTH = 5;

log.forEach((node, i) => {
    if (i !== 0 && node.branch === log[i - 1].branch) {
        createCommit(node);
    } else {
        if (!branches[node.branch]) {
            createBranch(node);
        } else {
            createCommit(node);
        }
    }
});

function createCommit(node) {
    shift++;
    const circle = make('circle');
    const lastXPos = branches[node.branch].lastXPos;
    config(circle, {
        "cx": 25 + shift * COMMIT_SPAN,
        "cy": branches[node.branch].row * BRANCH_SPAN,
        "r": COMMIT_R,
        "fill": branches[node.branch].color,
        "node": node.node,
        "branch": node.branch
    });
    svg.appendChild(circle);

    const line = make('line');
    config(line, {
        "x1": 25 + shift * COMMIT_SPAN,
        "y1": branches[node.branch].row * BRANCH_SPAN,
        "x2": lastXPos,
        "y2": branches[node.branch].row * BRANCH_SPAN,
        "stroke": branches[node.branch].color,
        "stroke-width": LINE_WIDTH
    })
    svg.appendChild(line);
    branches[node.branch].lastXPos = 25 + shift * COMMIT_SPAN;
}

function createBranch(node) {
    freeRow++;
    const x = node.parent ? branches[findParentBranch(node.parent)].lastXPos + COMMIT_SPAN : 25;
    const y = freeRow * BRANCH_SPAN;
    branches[node.branch] = {
        row: freeRow,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        lastXPos: x,
        lastYPos: y
    };
    const circle = make('circle');

    config(circle, {
        "cx": x,
        "cy": y,
        "r": COMMIT_R,
        "fill": branches[node.branch].color,
        "node": node.node,
        "branch": node.branch
    });
    svg.appendChild(circle);
    branches[node.branch].lastXPos = x;
    branches[node.branch].lastYPos = y;
    //shift++;
    node.parent && createPath(node)
}

function config(element, props) {
    Object.keys(props).forEach(key => {
        element.setAttributeNS(null, key, props[key]);
    });
}

function make(type) {
    return document.createElementNS(svgNS, type);
}

function findParentBranch(node) {
    const parent = log.find(e => e.node === node);
    return parent.branch
}

function createPath(node) {
    const path = make('path');
    const b = branches[node.branch];
    const x = b.lastXPos;
    const y = b.lastYPos;
    const p = branches[findParentBranch(node.parent)];
    config(path, {
        "d": `M${p.lastXPos},${p.lastYPos} C${p.lastXPos+COMMIT_SPAN/2},${p.lastYPos} ${x-COMMIT_SPAN/2},${y} ${x},${y}`,
        "stroke": b.color,
        "stroke-width": LINE_WIDTH,
        "fill": "transparent"
    });
    svg.appendChild(path);
}
