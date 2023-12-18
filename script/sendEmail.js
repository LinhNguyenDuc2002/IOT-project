emailjs.init('F3cZydywzr5PNESYo');

function alertChangeEmail(now, email) {

    emailjs.send('service_zegy3s3', 'template_j6mwwqs', {
        to_email: email,
        from_name: 'Plant room monitoring system',
        content: "At " + now + ", " +
                "you changed your notification email to " + email + ". " +
                "This means, from now on, notifications from your monitoring system will be sent to this email.",
    })
    .then(function(response) {
        console.log('Email sent:', response);
    }, function(error) {
        console.error('Error sending email:', error);
    });
}

function alertChangePlant(now, plant) {
    emailRef.once('value', async function(snapshot) {
        if (snapshot.exists()) {
            var email = snapshot.val().address;

            emailjs.send('service_zegy3s3', 'template_j6mwwqs', {
                to_email: email,
                from_name: 'Plant room monitoring system',
                content: "At " + now + ", " +
                "you changed the type of plant to " + plant + ". " +
                "From now on, the system will monitor the environment where this plant is grown.",
            })
            .then(function(response) {
                console.log('Email sent:', response);
            }, function(error) {
                console.error('Error sending email:', error);
            });
        } else {
            console.log("Không có dữ liệu từ snapshot");
        }
    });
}

function alertEnvironment(temp, hum, now) {
    emailRef.once('value', async function(snapshot) {
        if (snapshot.exists()) {
            var email = snapshot.val().address;

            emailjs.send('service_zegy3s3', 'template_j6mwwqs', {
                to_email: email,
                from_name: 'Plant room monitoring system',
                content: "WARNING!\n" + 
                        "At " + now + ", " +
                        "the sensors of the monitoring system detect:\n" +
                        "Temperature: " + temp + "°C\n" +
                        "Humidity: " + hum + "%\n\n" +
                        "Current environmental conditions are not good for your plants. Make a plan to improve the environment immediately!",
            })
            .then(function(response) {
                console.log('Email sent:', response);
            }, function(error) {
                console.error('Error sending email:', error);
            });
        } else {
            console.log("Không có dữ liệu từ snapshot");
        }
    });
}