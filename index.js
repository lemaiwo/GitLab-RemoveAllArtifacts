process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
var rp = require('request-promise');
var shell = require('shelljs');
const projectOptions = ()=>({
    uri: 'https://isoapp1199.belgrid.net/api/v4/projects',
    qs: {
        private_token: '8iAdR637sa_o6z8z8eRu', // -> uri + '?access_token=xxxxx%20xxxxx'
        per_page:100
    },
    headers: {
        
    },
    json: true // Automatically parses the JSON string in the response
});
const jobOptions = (projid,page) => ({
    uri: 'https://isoapp1199.belgrid.net/api/v4/projects/' + projid + '/jobs',
    qs: {
        private_token: '8iAdR637sa_o6z8z8eRu', // -> uri + '?access_token=xxxxx%20xxxxx'
        per_page: 100,
        page: page
    },
    headers: {

    },
    json: true // Automatically parses the JSON string in the response
});
const jobDeleteOptions = (projid,jobid) => ({
    method: 'DELETE',
    uri: 'https://isoapp1199.belgrid.net/api/v4/projects/' + projid + '/jobs/' + jobid + "/artifacts",
    qs: {
        private_token: '8iAdR637sa_o6z8z8eRu', // -> uri + '?access_token=xxxxx%20xxxxx'
    },
    headers: {

    },
    json: true // Automatically parses the JSON string in the response
});

const getAllJobs = async (projid) => {
    let jobs = [];
    let totalJobs = 0;
    let page = 1;
    do {
        totalJobs = jobs.length;
        let jobsPage = await rp(jobOptions(projid,page));
        jobs.push(...jobsPage);
        page++;
    } while (totalJobs !== jobs.length)
    return jobs.map(job=>({projectid:projid,jobid:job.id}))
    // return jobs;
}
const flattened = arr => [].concat(...arr);

const run = async () => {
    let projects = await rp(projectOptions());
    let jobs = flattened(await Promise.all(projects.map(project => getAllJobs(project.id))));
    for(let job of jobs){       
        await rp(jobDeleteOptions(job.projectid,job.jobid)) 
        console.log("deleting job:" + job.jobid +" for project: "+job.projectid)
    }
    console.log("done")
}
run()