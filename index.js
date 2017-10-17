const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

let shift = 0;
let freeRow = 1;
const branches = {};

const COMMIT_R = 7;
const COMMIT_SPAN = 50;
const BRANCH_SPAN = 16;
const LINE_WIDTH = 4;

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
    const {
        lastXPos,
        row,
        color
    } = branches[node.branch];
    config(circle, {
        "cx": 25 + shift * COMMIT_SPAN,
        "cy": row * BRANCH_SPAN,
        "r": COMMIT_R,
        "fill": color,
        "node": node.node,
        "branch": node.branch
    });

    const text = make('text');
    config(text, {
        "x": 25 + shift * COMMIT_SPAN - COMMIT_R,
        "y": 12,
        "font-size": 10,
        "font-family": "monospace"
    })
    text.innerHTML = node.node;
    svg.appendChild(text);

    svg.appendChild(circle);

    const line = make('line');
    config(line, {
        "x1": 25 + shift * COMMIT_SPAN,
        "y1": row * BRANCH_SPAN,
        "x2": lastXPos,
        "y2": row * BRANCH_SPAN,
        "stroke": color,
        "stroke-width": LINE_WIDTH
    })
    svg.appendChild(line);
    branches[node.branch].lastXPos = 25 + shift * COMMIT_SPAN;
}

function createBranch(node) {
    freeRow++;
    node.parent && shift++
    const x = node.parent ? 25 + shift * COMMIT_SPAN : 25;
    const y = freeRow * BRANCH_SPAN;
    branches[node.branch] = {
        row: freeRow,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        lastXPos: x,
        lastYPos: y
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
        "x": 25 + shift * COMMIT_SPAN - COMMIT_R,
        "y": 12,
        "font-size": 10,
        "font-family": "monospace"
    })
    text.innerHTML = node.node;
    svg.appendChild(text);
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
        "stroke": color,
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
