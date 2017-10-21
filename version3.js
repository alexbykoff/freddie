const svg = document.getElementById('vis');
const svgNS = svg.namespaceURI;

const branches = {};
const rows = [];
const COMMIT_R = 5;
const COMMIT_SPAN = 26;
const BRANCH_SPAN = 12;
const LINE_WIDTH = 4;
const LEFT_OFFSET = 50;

let column = 1;
const upperCommit = log[0].rev;

svg.style.height = log.length * COMMIT_SPAN + 100 + 'px';

log.forEach(e => {
    branches[e.branch]
        ? branches[e.branch].push(e)
        : (branches[e.branch] = [e]);
});

const sorts = log.map(revisionSpread).filter(byUniqueBranch);
svg.style.width = sorts.length * BRANCH_SPAN + LEFT_OFFSET + 'px';

sorts.forEach(createLine);

Object.values(branches).forEach(createForks);
log.forEach(createMerges);

function createMerges(commit) {
    if (commit.parents.length > 1) {
        const parent = findByNodeId(commit.parents[1]);
        const self = findByNodeId(commit.node);
            const color = parent ? +parent.getAttribute('fill') : 'black';
        connectCommits(parent, self, color);
    }
}

function createForks(branch) {
    const parent = findByNodeId(branch.slice(-1)[0].parents[0]);
    const self = findByNodeId(branch.slice(-1)[0].node);
    connectCommits(parent, self, 'green');
}

function connectCommits(parent, self, stroke) {
    if (!parent) return;
    const from = make('line');
    config(from, {
        x1: +parent.getAttribute('cx'),
        y1: +parent.getAttribute('cy'),
        x2: +self.getAttribute('cx'),
        y2: +parent.getAttribute('cy'),
        stroke,
        'stroke-width': 1,
    });
    const to = make('line');
    config(to, {
        x1: +self.getAttribute('cx'),
        y1: +parent.getAttribute('cy'),
        x2: +self.getAttribute('cx'),
        y2: +self.getAttribute('cy') + COMMIT_R,
        stroke,
        'stroke-width': 1,
    });
    svg.appendChild(from);
    svg.appendChild(to);
}

function findByNodeId(commitId) {
    return [...document.querySelectorAll('circle')].find(
        e => e.getAttribute('node') === commitId.slice(0, 6),
    );
}

function byUniqueBranch(b, i) {
    return log.findIndex(e => b.branch === e.branch) === i;
}

function revisionSpread(b) {
    const revs = log
        .filter(commit => commit.branch === b.branch)
        .map(commit => commit.rev);
    const top = COMMIT_SPAN + (upperCommit - Math.max(...revs)) * COMMIT_SPAN;
    const bottom =
        COMMIT_SPAN + (upperCommit - Math.min(...revs)) * COMMIT_SPAN;
    const branch = b.branch;
    return {
        top,
        bottom,
        branch,
    };
}

function constructBranch(branch) {}

function createLine(branch, index) {
    const x = LEFT_OFFSET + index * BRANCH_SPAN;
    const color = randomColor();
    if (branch.top !== branch.bottom) {
        const line = make('line');
        config(line, {
            x1: x,
            y1: branch.top,
            x2: x,
            y2: branch.bottom,
            'stroke-width': LINE_WIDTH,
            stroke: color,
            branch: branch.branch,
        });
        svg.appendChild(line);
    }
    branches[branch.branch].forEach((commit, i) => {
        const circle = make('circle');
        config(circle, {
            cx: x,
            cy: COMMIT_SPAN + (upperCommit - commit.rev) * COMMIT_SPAN,
            r: COMMIT_R,
            fill: color,
            node: commit.node.slice(0, 6),
            branch: branch.branch,
            stroke: 'black',
            'stroke-width': 1,
        });
        svg.appendChild(circle);
        if (i === 0) {
            const text = make('text');
            text.innerHTML = branch.branch;
            config(text, {
                x: x + BRANCH_SPAN,
                y: COMMIT_SPAN + (upperCommit - commit.rev) * COMMIT_SPAN,
                'font-size': 12,
                'font-family': 'monospace',
            });
            svg.appendChild(text);
        }
        const text = make('text');
        text.innerHTML = commit.rev;
        config(text, {
            x: 2,
            y: COMMIT_SPAN + (upperCommit - commit.rev) * COMMIT_SPAN,
            'font-size': 12,
            'font-family': 'monospace',
        });
        svg.appendChild(text);
    });
}

function createLinkToParentBranch(branch) {}

function config(element, props) {
    Object.keys(props).forEach(key =>
        element.setAttributeNS(null, key, props[key]),
    );
}

function make(type) {
    return document.createElementNS(svgNS, type);
}

function randomColor() {
    const color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
}
