const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCeyKkt1JrO90CjV5WCsS-xA';
const README_PATH = '../README.md';
const MAX_RESULTS = 3
const START_MARKER = '<!-- YOUTUBE:START -->';
const END_MARKER = '<!-- YOUTUBE:END -->';
const ENCODING = 'utf-8';

async function getLatestVideos() {
  console.log('Getting Youtube latest videos');
  const youtube = google.youtube({
    version: 'v3',
    auth: API_KEY,
  });

  const response = await youtube.search.list({
    part: 'snippet',
    channelId: CHANNEL_ID,
    maxResults: MAX_RESULTS,
    order: 'date',
    type: 'video',
    videoDuration: 'any' // long medium short
  });

  const videos = response.data.items.map(item => {
    const videoId = item.id.videoId;
    const title = item.snippet.title;
    const thumbnailUrl = item.snippet.thumbnails.high.url;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    // return `### [${title}](${videoUrl})\n[![${title}](${thumbnailUrl})](${videoUrl})`;
    return `<a href='https://www.youtube.com/watch?v=M7F6tOaEOcA' target='_blank'>
  <img width='30%' src='https://i.ytimg.com/vi/M7F6tOaEOcA/hqdefault.jpg'/>
</a>`;
  });

  return videos.join('\n');
}

function getReadmeContent() {
  console.log('Getting README content');
  const readmePath = path.join(__dirname, README_PATH);
  const readmeContent = fs.readFileSync(readmePath, { encoding: ENCODING });
  return readmeContent;
}

function updateReadme(videos) {
  console.log('Updating README');

  const readmeContent = getReadmeContent();
  const startIndex = readmeContent.indexOf(START_MARKER);
  const endIndex = readmeContent.indexOf(END_MARKER);

  const hasStartMarker = startIndex !== -1;
  const hasEndMarker = endIndex !== -1;
  const areMarkersWellPositioned =
    hasStartMarker &&
    hasEndMarker &&
    ((startIndex + START_MARKER.length) < endIndex);

  if (!hasStartMarker || !hasEndMarker || !areMarkersWellPositioned) {
    throw new Error('README markers not found or are misconfigured.');
  }

  const updatedReadmeContent = readmeContent.substring(0, startIndex + START_MARKER.length) + '\n' + videos + '\n' + readmeContent.substring(endIndex);

  fs.writeFileSync(README_PATH, updatedReadmeContent);
  console.log('README updated with the latest YouTube videos');
}

async function start() {
  console.log('Script started');
  try {
    const videos = await getLatestVideos();
    updateReadme(videos);
  } catch (error) {
    console.error(error);
  } finally {
    console.log('Script finished');
  }
}

start();
