const svg = document.getElementById("vis");
const svgNS = svg.namespaceURI;

const branches = {};
const rows = [];
const COMMIT_R = 6;
const COMMIT_SPAN = 22;
const BRANCH_SPAN = 20;
const LINE_WIDTH = 5;

let column = 1;
const upperCommit = log[0].rev;

// svg.style.width = log.length * COMMIT_SPAN + 100 + "px";

log.forEach(e => {
    //normalize object to store as {branch: [commits]}
    branches[e.branch] ?
        branches[e.branch].push(e) :
        branches[e.branch] = [e];
});

console.log(branches);

const sorts = log.map(findRevisionSpread)

console.log(sorts);




function findRevisionSpread(b){
    const revs = log.filter(commit => commit.branch === b.branch).map(commit => commit.rev);
    const top =  (upperCommit - Math.max(...revs)) * COMMIT_SPAN
    const bottom =  (upperCommit - Math.min(...revs)) * COMMIT_SPAN
    const branch = b.branch
        return({top, bottom, branch})
}


function constructBranch(branch) {

}

function createLine(commit){

}

function createLinkToParentBranch(branch) {


}


function createCommit(cx, cy, fill, commit) {
    const circle = make('circle');
    config(circle, {
        cx,
        cy,
        fill,
        "r": COMMIT_R,
        branch: commit.branch,
        node: commit.node.slice(0, 6)
    });
    svg.appendChild(circle);
}


function config(element, props) {
    Object.keys(props).forEach(key => element.setAttributeNS(null, key, props[key]));
}

function make(type) {
    return document.createElementNS(svgNS, type)
}

function randomColor() {
    const color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
}
