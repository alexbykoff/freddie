const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

let revision = 0;
let branchRow = 1;
const branches = {};

const COMMIT_R = 8;
const COMMIT_SPAN = 50;
const BRANCH_SPAN = 16;
const LINE_WIDTH = 5;

log.forEach((node, i) => {
    if (node.parent && node.branch === log[i - 1].branch) {
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
    revision++;
    const circle = make('circle');
    const {
        lastXPos,
        row,
        color
    } = branches[node.branch];
    config(circle, {
        "cx": 25 + revision * COMMIT_SPAN,
        "cy": row * BRANCH_SPAN,
        "r": COMMIT_R,
        "fill": color,
        "node": node.node,
        "branch": node.branch
    });

    const text = make('text');
    config(text, {
        "x": 25 + revision * COMMIT_SPAN - COMMIT_R,
        "y": 12,
        "font-size": 10,
        "font-family": "monospace"
    })
    text.innerHTML = node.node;
    svg.appendChild(text);
    svg.appendChild(circle);

    const line = make('line');
    config(line, {
        "x1": 25 + revision * COMMIT_SPAN,
        "y1": row * BRANCH_SPAN,
        "x2": lastXPos,
        "y2": row * BRANCH_SPAN,
        "stroke": color,
        "stroke-width": LINE_WIDTH
    })
    svg.appendChild(line);
    branches[node.branch].lastXPos = 25 + revision * COMMIT_SPAN;
}

function createBranch(node) {
    branchRow++;
    node.parent && revision++;
    branches[node.branch] = {
        row: branchRow,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        lastXPos: node.parent ? 25 + revision * COMMIT_SPAN : 25,
        lastYPos: branchRow * BRANCH_SPAN
    };

    const {
        lastXPos,
        lastYPos,
        row,
        color
    } = branches[node.branch];

    const circle = make('circle');
    config(circle, {
        "cx": lastXPos,
        "cy": lastYPos,
        "r": COMMIT_R,
        "fill": color,
        "node": node.node,
        "branch": node.branch
    });
    
    const text = make('text');
    config(text, {
        "x": 25 + revision * COMMIT_SPAN - COMMIT_R,
        "y": 12,
        "font-size": 10,
        "font-family": "monospace"
    })
    text.innerHTML = node.node;
    svg.appendChild(text);
    svg.appendChild(circle);

    if (!node.parent) return;

    const horizontalLine = make('line');
    const parentX = +getPositionOfParentNode(node.parent, "cx");
    const parentY = +getPositionOfParentNode(node.parent, "cy");
    config(horizontalLine, {
        "x1": lastXPos - COMMIT_R,
        "y1": lastYPos,
        "x2": parentX + COMMIT_SPAN - COMMIT_R,
        "y2": lastYPos,
        "stroke": branches[findParentBranch(node.parent)].color,
        "stroke-width": LINE_WIDTH
    })
    svg.appendChild(horizontalLine);

    const diagonalLine = make('line');
    config(diagonalLine, {
        "x1": parentX + COMMIT_SPAN - COMMIT_R,
        "y1": lastYPos,
        "x2": parentX,
        "y2": parentY,
        "stroke": branches[findParentBranch(node.parent)].color,
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
    return document.createElementNS(svgNS, type)
}

function findParentBranch(node) {
    return log.find(e => e.node === node).branch
}

function getPositionOfParentNode(node, attr) {
    return [...document.querySelectorAll('circle')]
        .find(e => e.getAttribute("node") === node)
        .getAttribute(attr)
}
