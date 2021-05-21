document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));

  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archive').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // By default, load the inbox
  load_mailbox('inbox');
});

  // This will show mail in detail view.
  function show_mail(mailId, isSent) {
    document.querySelector('#alert').innerHTML = ' ';
    document.querySelector('#email-detail').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    fetch(`/emails/${mailId}`)
    .then(response => response.json())
    .then(email => {
        // Print emails
        // console.log(email);

        // ... do something else with emails ...
          document.querySelector("#email-detail").innerHTML = `
          <div class="card-header">
          From: ${email.sender} <br>
          To: ${email.recipients}
          <button style="display: none; margin-left:50rem;" id="reply-button" onclick="reply(${mailId})" type="button" class="btn btn-primary mr-4">Reply</button>

          </div>
          <div class="card-body">
          <h5 class="card-title">${email.subject}</h5>
          <p class="card-text">${email.body}</p>
          </div>
          <div class="card-footer text-muted text-right">
          <button style="display: none;" id="archive-button" onclick="archive(${mailId}, ${!email.archived})" type="button" class="btn btn-success mr-4">${email.archived?'Unarchive':'Archive'}</button>
          ${email.timestamp}
          </div>
          `
    });
    fetch(`/emails/${mailId}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

  setTimeout(function () {
    if (!isSent) {
      document.querySelector('#archive-button').style.display='block';
      document.querySelector('#reply-button').style.display='block';

    }
  }, 120);
  return false;
};


// For replying a mail we will call this function.
function reply(mailId) {
  fetch(`/emails/${mailId}`)
  .then(response => response.json())
  .then(email => {
      // Print emails
      if (!email.subject.includes("Re: ")) {
        email.subject = "Re: " + email.subject;
      }
        email.body = `"On ${email.timestamp} ${email.sender} wrote: ${email.body}" `
      compose_email(event, email.sender, email.subject, email.body);

  });
  return false;

}

// This function will mark a mail as archived or unarchived if its already archived.
  function archive(mailId, arch) {
      fetch(`/emails/${mailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: arch
      })
    })

    setTimeout(function () {
        load_mailbox('inbox')
    }, 100);

    return false;
  }

// This function put active class on the clicked nav item.
const make_active = (itemId) => {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((item) => {
    item.classList.remove('active');
  });
  document.querySelector(`#${itemId}`).classList.add('active');
}


// This function display compose mail section.
function compose_email(event, recipients_mail="", subject_mail="", body_mail="") {
  document.querySelector('#alert').innerHTML= "";

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  make_active("compose");

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients_mail;
  document.querySelector('#compose-subject').value = subject_mail;
  document.querySelector('#compose-body').value = body_mail;

  document.querySelector("form").onsubmit = function() {
    const send_to = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const content = document.querySelector("#compose-body").value;

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: send_to,
            subject: subject,
            body: content
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result

          // console.log(result);
          load_mailbox('sent');

          if (result.message) {
              document.querySelector('#alert').innerHTML = `<div class="alert alert-primary" role="alert">
              ${result.message}
              </div>`;
            } else if (result.error){
              document.querySelector('#alert').innerHTML = `<div class="alert alert-danger" role="alert">
              ${result.error}
              </div>`;
            }
      });

    return false;
  };
};


// This function displays inbox, sent or achive section depend on the argument.
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#alert').innerHTML = '';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-detail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  make_active(mailbox);

  let mails = '';

fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    // console.log(emails);
    if (emails.length > 0) {

      emails.forEach((item, i) => {
          var mailText = `<div class="card" style="width: 50rem; ${item.read?'':'background: rgba(128, 128, 128, 0.3);'}">
          <div class="card-body">
          <a href="#" onclick="show_mail(${item.id}, ${mailbox==="sent"})"><h5 class="card-title">${item.subject}</h5></a>
          <h6 class="card-subtitle mb-3 text-muted">from <span class="font-weight-bold">${item.sender}</span> to <span class="font-weight-bold">${item.recipients}</span></h6>
          <p class="card-text">${item.body}</p>
          </div>
          </div>`
        mails += mailText;
        document.querySelector('#emails-view').innerHTML = mails;
      });
    } else {
      document.querySelector('#emails-view').innerHTML = '';
    }
  });

  // Show the mailbox name
  document.querySelector('#email-heading').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
}
