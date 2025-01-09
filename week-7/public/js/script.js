const socket = io();

document.addEventListener('DOMContentLoaded', function() {
    M.Modal.init(document.querySelectorAll('.modal'));
    
    socket.on('initial-feedbacks', (feedbacks) => {
        displayFeedbacks(feedbacks);
    });
    
    socket.on('new-feedback', (feedback) => {
        addFeedbackToDisplay(feedback);
    });

    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback();
    });
});

function displayFeedbacks(feedbacks) {
    const feedbackRow = document.querySelector('.row:first-of-type');
    feedbackRow.innerHTML = '';
    feedbacks.forEach(feedback => addFeedbackToDisplay(feedback));
}

function addFeedbackToDisplay(feedback) {
    const feedbackRow = document.querySelector('.row:first-of-type');
    const feedbackCard = document.createElement('div');
    feedbackCard.className = 'col s12 m6';
    feedbackCard.innerHTML = `
        <div class="card blue-grey darken-1 animate">
            <div class="card-content white-text">
                <span class="card-title">${feedback.name}</span>
                <p>${feedback.message}</p>
            </div>
            <div class="card-action">
                <a href="mailto:${feedback.email}">${feedback.email}</a>
            </div>
        </div>
    `;
    feedbackRow.appendChild(feedbackCard);
}

function submitFeedback() {
    const feedback = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('feedback').value
    };

    fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback)
    })
    .then(response => response.json())
    .then(data => {
        if (data.statusCode === 200) {
            const modal = M.Modal.getInstance(document.getElementById('successModal'));
            modal.open();
            document.getElementById('feedbackForm').reset();
            M.updateTextFields();
        }
    })
    .catch(err => {
        console.error(err);
        M.toast({html: 'Error submitting feedback'});
    });
}