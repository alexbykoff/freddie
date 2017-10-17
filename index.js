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
    shift++
    const x = node.parent ? 25 + shift * COMMIT_SPAN : 25;
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
    if (!node.parent) return;

    const horizontalLine = make('line');
    config(horizontalLine, {
        "x1": x,
        "y1": y,
        "x2": +getPositionOfParentNode(node.parent, "cx") + COMMIT_SPAN,
        "y2": y,
        "stroke": branches[node.branch].color,
        "stroke-width": LINE_WIDTH
    })
    svg.appendChild(horizontalLine);

    const diagonalLine = make('line');
    config(diagonalLine, {
        "x1": +getPositionOfParentNode(node.parent, "cx") + COMMIT_SPAN,
        "y1": y,
        "x2": +getPositionOfParentNode(node.parent, "cx"),
        "y2": +getPositionOfParentNode(node.parent, "cy"),
        "stroke": branches[node.branch].color,
        "stroke-width": LINE_WIDTH
    })
    svg.appendChild(diagonalLine);
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
    return log.find(e => e.node === node).branch
}

function getPositionOfParentNode(node, attr) {
    return [...document.querySelectorAll('circle')]
        .find(e => e.getAttribute("node") === node)
        .getAttribute(attr)
}
