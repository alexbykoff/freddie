const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

log = log.reverse();

let revision = 0;
let branchRow = 1;
const branches = {};

const COMMIT_R = 5;
const COMMIT_SPAN = 30;
const BRANCH_SPAN = 10;
const LINE_WIDTH = 2;
let textStep =1;

//svg.style.width = log.length * COMMIT_SPAN + 100 + "px";
log.forEach((node, i) => {
    if (node.parents.length === 2) {
        return createMerge(node);
    }
    if (node.rev !== 0 && node.branch === log[i - 1].branch) {
        createCommit(node);
    } else {
        if (!branches[node.branch]) {
            createBranch(node);
        } else {
            createCommit(node);
        }
    }
});

console.log(`Total branches: ${Object.keys(branches).length}`)

function createCommit(node) {
    revision++;
    const circle = make('circle');
    const {lastXPos, row, color} = branches[node.branch];
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
    text.innerHTML = node.rev;
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
    node.rev !== 0 && revision++;
    svg.style.height = BRANCH_SPAN * branchRow + 100 + "px";
    branches[node.branch] = {
        branch: node.branch,
        row: branchRow,
        revision: revision,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        lastXPos: node.rev !== 0
            ? 25 + revision * COMMIT_SPAN
            : 25,
        lastYPos: branchRow * BRANCH_SPAN
    };

    const {lastXPos, lastYPos, row, color} = branches[node.branch];

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
        "font-family": "monospace",
    })
    text.innerHTML = node.rev;
    svg.appendChild(text);
    svg.appendChild(circle);

    if (node.rev === 0) {
        return
    }

    const horizontalLine = make('line');
    const parentX = +getAttrFromAnotherNode(node.parents[0], "cx");
    const parentY = +getAttrFromAnotherNode(node.parents[0], "cy");
    config(horizontalLine, {
        "x1": lastXPos - COMMIT_R,
        "y1": lastYPos,
        "x2": parentX + COMMIT_SPAN - COMMIT_R,
        "y2": lastYPos,
        "stroke": branches[getParentBranch(node.parents[0])].color,
        "stroke-width": LINE_WIDTH
    })
    svg.appendChild(horizontalLine);

    const diagonalLine = make('line');
    config(diagonalLine, {
        "x1": parentX + COMMIT_SPAN - COMMIT_R,
        "y1": lastYPos,
        "x2": parentX,
        "y2": parentY,
        "stroke": branches[getParentBranch(node.parents[0])].color,
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

function getParentBranch(parent) {
    return log.find(e => e.node === parent).branch
}

function getAttrFromAnotherNode(parent, attr) {
    return [...document.querySelectorAll('circle')].find(e => e.getAttribute("node") === parent).getAttribute(attr)
}

function createMerge(node) {
    if (branchExists(node) === false) {
        // Use case: A merged into B -> new branch C created from B -> C commited
        createBranch(node);
        branches[node.branch].createdFromMerge = true;
        console.log(branches[node.branch]);
    }
    createCommit(node);
    createMergeLines(node);
}

function createMergeLines(node){
    const {lastXPos, lastYPos, row, color} = branches[node.branch];
    if (!branches[node.branch].createdFromMerge) {
        const line = make('line');
        const line2 = make('line');
        config(line, {
            "x1": lastXPos- COMMIT_R,
            "y1": lastYPos,
            "x2": lastXPos - COMMIT_SPAN,
            "y2": +getAttrFromAnotherNode(node.parents[1], "cy"),
            "stroke": branches[getParentBranch(node.parents[1])].color,
            "stroke-width": LINE_WIDTH
        });
        config(line2, {
            "x1": lastXPos - COMMIT_SPAN,
            "y1": +getAttrFromAnotherNode(node.parents[1], "cy"),
            "x2": +getAttrFromAnotherNode(node.parents[1], "cx") + COMMIT_R,
            "y2": +getAttrFromAnotherNode(node.parents[1], "cy"),
            "stroke": branches[getParentBranch(node.parents[1])].color,
            "stroke-width": LINE_WIDTH
        });
        svg.appendChild(line);
        svg.appendChild(line2);
    }
}

function branchExists(node) {
    return Boolean(branches[node.branch]);
}
