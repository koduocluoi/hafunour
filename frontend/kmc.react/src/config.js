const dev = {
    s3: {
        REGION: "ap-southeast-1",
        BUCKET: "kmc-dev-productimagesbucket-sjxu1v38ejcu"
    },
    apiGateway: {
        REGION: "ap-southeast-1",
        URL: "https://api.kimminhchau.org/dev"
    },
    cognito: {
        REGION: "ap-southeast-1",
        USER_POOL_ID: "ap-southeast-1_PAeGPnsZP",
        APP_CLIENT_ID: "5sssm7auc1i754k6qmp10rlc2s",
        IDENTITY_POOL_ID: "ap-southeast-1:5948e688-93e1-4e67-b21e-ae7ad4f542ed"
    }
};

const prod = {
    s3: {
        REGION: "ap-southeast-1",
        BUCKET: "kmc-prod-productimagesbucket-1eqcfpbnzvmap"
    },
    apiGateway: {
        REGION: "ap-southeast-1",
        URL: "https://api.kimminhchau.org/prod"
    },
    cognito: {
        REGION: "ap-southeast-1",
        USER_POOL_ID: "ap-southeast-1_Q7fRDMOT3",
        APP_CLIENT_ID: "8hrfoejmr5uctfdt279349lgh",
        IDENTITY_POOL_ID: "ap-southeast-1:85dc2df8-3783-4fe2-8e84-8d6260086421"
    }
};

// Default to dev if not set
const config = process.env.REACT_APP_STAGE === 'prod'
? prod
: dev;

export default {
    // Add common config values here
    MAX_ATTACHMENT_SIZE: 5000000,
    ...config
};
