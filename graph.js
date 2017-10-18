const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

log = log.reverse();

let revision = 0;
let branchRow = 1;
const branches = {};

let rows = [];

const COMMIT_R = 6;
const COMMIT_SPAN = 22;
const BRANCH_SPAN = 20;
const LINE_WIDTH = 5;

svg.style.width = log.length * COMMIT_SPAN + 100 + "px";

log.forEach(e => {
    //normalize object to store as {branch: [commits]}
    branches[e.branch] ?
        branches[e.branch].push(e) :
        branches[e.branch] = [e];
});

Object.values(branches).forEach((branch, branchIndex) => constructBranch(branch, branchIndex));

function constructBranch(branch, branchIndex) {
    const color = randomColor();
    for (let col = branch[0].rev; col <= branch[branch.length - 1].rev; col++) {
        // we plant dots from lower revision to higher (thru all the range, not only commits)
        let row = 1;
        while (rows[row] && rows[row] >= col) {
            // check if row is free at that revision, if not, check lower row
            row += 1;
        }
        placeDot(col, row, branch, color);
        rows[row] = col;
        // store the column which row lasts to
    }
    drawLine(branch);

    // garbage collection
    [...document.querySelectorAll('circle')]
    .filter(e => e.getAttribute("type") === "temp")
        .forEach(e => e.remove());
}

function placeDot(col, row, branch, fill) {
    const dot = make('circle');
    const cx = COMMIT_SPAN + col * COMMIT_SPAN;
    const cy = BRANCH_SPAN + row * BRANCH_SPAN;
    config(dot, {
        cx,
        cy,
        r: 3,
        fill,
        branch: branch[0].branch,
        type: "temp"
    })
    svg.appendChild(dot);
    const commit = branch.find(e => e.rev === col)
    if (commit) {
        createCommit(cx, cy, fill, commit)
    }
}

function createCommit(cx, cy, fill, commit) {
    const circle = make('circle');
    config(circle, {
        cx,
        cy,
        fill,
        "r": COMMIT_R,
        branch: commit.branch,
        node: commit.node
    });
    svg.appendChild(circle);
}

function drawLine(branch) {
    const pool = [...document.querySelectorAll('circle')].filter(e => e.getAttribute("branch") === branch[0].branch);
    // pick all circles of one branch, connect with lines
    if (pool.length > 1) {
        for (let i = 0; i < pool.length - 1; i++) {
            const line = make('line');
            config(line, {
                "x1": pool[i].getAttribute("cx"),
                "y1": pool[i].getAttribute("cy"),
                "x2": pool[i + 1].getAttribute("cx"),
                "y2": pool[i + 1].getAttribute("cy"),
                "stroke": pool[i].getAttribute("fill"),
                "stroke-width": LINE_WIDTH
            })
            svg.appendChild(line);
        }
    }
}

function config(element, props) {
    Object.keys(props).forEach(key => {
        element.setAttributeNS(null, key, props[key]);
    });
}

function make(type) {
    return document.createElementNS(svgNS, type)
}

function randomColor() {
    const color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
}
