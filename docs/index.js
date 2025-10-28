'use strict'

const BASE_URL = 'https://github.com/MSFTserver/print2a/tree/master/';
const INITIAL_LIST_LENGTH = 10;

function handleUrls(string) {
  return string.replace('%','%25');
}

function displayResults(array) {
  if(!array) {
    $('#results').html(null);
    return;
  }

  // Fixed: Prevent XSS by using jQuery DOM manipulation instead of string concatenation
  const $ul = $('<ul>');
  array.forEach(r => {
    const $li = $('<li>');
    const $a = $('<a>')
      .attr('href', handleUrls(BASE_URL + r.location))
      .attr('target', '_blank')
      .attr('rel', 'noopener noreferrer')  // Security: prevent window.opener access
      .text(r.location);  // Safe text insertion
    $li.append($a);
    $ul.append($li);
  });
  $('#results').empty().append($ul);
}

$(document).ready(function(){
  const files = window.__print2a_files;

  $('#searchLocation').change(function(e) {
    const search = $(this).val();
    if(search == '') {
      return displayResults();
    }

    const results = files.filter(f => f.location.toLowerCase().indexOf(search.toLowerCase()) > -1);
    displayResults(results);
  });

  $('#searchTag').change(function(e) {
    const search = $(this).val();
    if(search == '') {
      return displayResults();
    }

    // Fixed: Prevent ReDoS by using safe string matching instead of user-controlled regex
    const searchLower = search.toLowerCase();
    const results = files.filter(f =>
      f.tags.some(t => t.toLowerCase().includes(searchLower))
    );
    displayResults(results);
  });

  // initial display
  const initialDisplay = files.sort((a,b) => dayjs(a.mtime).subtract(dayjs(b.mtime)))
  displayResults(initialDisplay.slice(0,INITIAL_LIST_LENGTH));
});