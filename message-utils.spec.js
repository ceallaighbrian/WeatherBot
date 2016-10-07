const getMessages = require('./message-utils');
const assert = require('assert');

const locationExample = {
    'sender': {
        'id': '1400694996626111'
    },
    'recipient': {
        'id': '611582722354288'
    },
    'timestamp': 1475867432598,
    'message': {
        'mid': 'mid.1475867432472:9d7b6592723bb3ed25',
        'seq': 1063,
        'attachments': [
            {
                'title': "Brians Location",
                'url': 'https://www.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3D37.792553753745%252C%2B-122.4244583896%26FORM%3DFBKPL1%26mkt%3Den-US&h=vAQGi5awO&s=1&enc=AZPdYF1amEq7ChQtOKGMDla2azrXkMaNFMKcVCKiudXBtA-4sS1jWYaIB_CmhftVXtGj_kqTFVBdQCYszYfJE6UG13czZ3F77XRvLw7O0PyRvQ',
                'type': 'location',
                'payload': {
                    'coordinates': {
                        'lat': 37.792553753745,
                        'long': -122.4244583896
                    }
                }
            }
        ]
    }
};

const messageExample = {
    'sender': {
        'id': '1400694996626111'
    },
    'recipient': {
        'id': '611582722354288'
    },
    'timestamp': 1475867541425,
    'message': {
        'mid': 'mid.1475867541401:6ccca8e55757852084',
        'seq': 1065,
        'text': '90210 weather'
    }
};


var messages = getMessages(locationExample);
assert(messages.length === 1);


console.log(messages);






