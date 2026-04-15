// State
let allBookmarks = [];
let activeTag = 'all';

// DOM elements
const form = document.getElementById('bookmark-form');
const titleInput = document.getElementById('title');
const urlInput = document.getElementById('url');
const tagInput = document.getElementById('tag');
const bookmarksList = document.getElementById('bookmarks-list');
const tagsFilter = document.getElementById('tags-filter');

// Load bookmarks when the page opens
document.addEventListener('DOMContentLoaded', loadBookmarks);

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const bookmark = {
    title: titleInput.value,
    url: urlInput.value,
    tag: tagInput.value || 'general'
  };

  const response = await fetch('/api/bookmarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookmark)
  });

  if (response.ok) {
    form.reset();
    loadBookmarks();
  }
});

// Fetch and display all bookmarks
async function loadBookmarks() {
  const response = await fetch('/api/bookmarks');
  allBookmarks = await response.json();
  renderTags();
  renderBookmarks();
}

// Render tag filter buttons
function renderTags() {
  const tags = ['all', ...new Set(allBookmarks.map(b => b.tag))];
  tagsFilter.innerHTML = tags.map(tag =>
    `<button class="tag-btn ${tag === activeTag ? 'active' : ''}" onclick="filterByTag('${tag}')">${tag}</button>`
  ).join('');
}

// Filter bookmarks by tag
function filterByTag(tag) {
  activeTag = tag;
  renderTags();
  renderBookmarks();
}

// Render bookmark cards
function renderBookmarks() {
  const filtered = activeTag === 'all'
    ? allBookmarks
    : allBookmarks.filter(b => b.tag === activeTag);

  if (filtered.length === 0) {
    bookmarksList.innerHTML = '<p style="color: #64748b; text-align: center;">No bookmarks yet. Add one above!</p>';
    return;
  }

  bookmarksList.innerHTML = filtered.map(bookmark => `
    <div class="bookmark-card">
      <div class="bookmark-info">
        <h3>${bookmark.title}</h3>
        <a href="${bookmark.url}" target="_blank">${bookmark.url}</a>
        <span class="bookmark-tag">${bookmark.tag}</span>
      </div>
      <button class="delete-btn" onclick="deleteBookmark(${bookmark.id})">Delete</button>
    </div>
  `).join('');
}

// Delete a bookmark
async function deleteBookmark(id) {
  await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
  loadBookmarks();
}