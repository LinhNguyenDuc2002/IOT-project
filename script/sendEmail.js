function alertChangeEmail(now, id) {
    emailRef.once('value', async function(snapshot) {
        if (snapshot.exists()) {
            var email = snapshot.exists().address;
            var TEMPLATE_ID = '';

            if(id == 1) {
                TEMPLATE_ID = 'template_j6mwwqs';
            }
            emailjs.send('service_zegy3s3', TEMPLATE_ID, {
                to_email: email,
                time: now,
                email: email
            })
            .then(function(response) {
                console.log('Email sent:', response);
            }, function(error) {
                console.error('Error sending email:', error);
            });
        }
    });
}