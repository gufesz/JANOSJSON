document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    Promise.all([
        fetch('https://jsonplaceholder.typicode.com/users').then(res => res.json()),
        fetch('https://jsonplaceholder.typicode.com/posts').then(res => res.json())
    ]).then(([users, posts]) => {
        displayUsersOnMap(users, map);

        groupAndDisplayPosts(users, posts);
    });

    function displayUsersOnMap(users, map) {
        let bounds = [];
        
        users.forEach(user => {
            if (user.address && user.address.geo) {
                const lat = parseFloat(user.address.geo.lat);
                const lng = parseFloat(user.address.geo.lng);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    const marker = L.marker([lat, lng]).addTo(map);
                    marker.bindTooltip(user.name, {permanent: false, direction: 'top'});
                    bounds.push([lat, lng]);
                }
            }
        });
        
        if (bounds.length > 0) {
            map.fitBounds(bounds);
        }
    }

    function groupAndDisplayPosts(users, posts) {
        const postsContainer = document.getElementById('posts');
        const userTabsContainer = document.getElementById('user-tabs');

        const postsByUser = {};
        posts.forEach(post => {
            if (!postsByUser[post.userId]) {
                postsByUser[post.userId] = [];
            }
            postsByUser[post.userId].push(post);
        });

        users.forEach(user => {
            if (postsByUser[user.id]) {
                const tab = document.createElement('div');
                tab.className = 'user-tab';
                tab.textContent = user.name;
                tab.dataset.userId = user.id;
                
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.user-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    displayUserPosts(postsByUser[user.id]);
                });
                
                userTabsContainer.appendChild(tab);
            }
        });

        if (userTabsContainer.firstChild) {
            userTabsContainer.firstChild.classList.add('active');
            const firstUserId = userTabsContainer.firstChild.dataset.userId;
            displayUserPosts(postsByUser[firstUserId]);
        }
        
        function displayUserPosts(userPosts) {
            postsContainer.innerHTML = '';
            
            userPosts.forEach(post => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.body}</p>
                `;
                postsContainer.appendChild(card);
            });
        }
    }
});