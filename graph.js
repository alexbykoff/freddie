const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

log = log.reverse();


let revision = 0;
let branchRow = 1;
const branches = {};

let rows = [];

const COMMIT_R = 5;
const COMMIT_SPAN = 15;
const BRANCH_SPAN = 15;
const LINE_WIDTH = 6;

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

function placeDot(col, row, branch, color) {
    const dot = make('circle');
    config(dot, {
        "cx": COMMIT_SPAN + col * COMMIT_SPAN,
        "cy": BRANCH_SPAN + row * BRANCH_SPAN,
        "r": 3,
        "fill": color,
        "branch": branch[0].branch
    })
    svg.appendChild(dot);
}


function createCommit(commit, branchIndex, color) {
    const circle = make('polyline');
    config(circle, {
        "cx": COMMIT_SPAN + commit.rev * COMMIT_SPAN,
        "cy": BRANCH_SPAN + branchIndex * BRANCH_SPAN,
        "fill": color,
        "r": COMMIT_R
    });
    svg.appendChild(circle);
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
