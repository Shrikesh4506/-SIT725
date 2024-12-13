document.addEventListener('DOMContentLoaded', function() {
    M.Modal.init(document.querySelectorAll('.modal'))
    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
        e.preventDefault()
        submitFeedback()
    })
})

function submitFeedback() {
    const feedback = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('feedback').value
    }

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
            const modal = M.Modal.getInstance(document.getElementById('successModal'))
            modal.open()
            document.getElementById('feedbackForm').reset()
            M.updateTextFields()
        }
    })
    .catch(err => {
        console.error(err)
        M.toast({html: 'Error submitting feedback'})
    })
}