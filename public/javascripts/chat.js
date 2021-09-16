
const x = document.currentScript.getAttribute('one');
///user/<%= id %>/chat/<%= chatter.userId.id%>
const clicableLis = document.querySelectorAll(".clickableLi")

clicableLis.forEach(item => item.onclick = function () {
    location.href = `/user/${x}/chat/${this.id}`
})
