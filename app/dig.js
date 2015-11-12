import router from './services/router';
import env    from './services/env';
import routes from './routes/dig';
import App    from './app';
import Topics from './stores/topics';

import {
          RemixQueryOptions,
          DigHeader,
          DigFooter
        } from './components';

env.Header          = DigHeader;
env.Footer          = DigFooter;
env.AppQueryOptions = RemixQueryOptions;

env.bannerTopic = Topics.namedTopics.digBanner;

var rewriteRules = [
  { regex: new RegExp(/^\/free_music/),                now: '/free' },
  { regex: new RegExp(/^\/music_for_film_and_video/),  now: '/film' },
  { regex: new RegExp(/^\/podcast_music/),             now: '/free'},
  { regex: new RegExp(/^\/hot/),                       now: '/edpicks'},
  { regex: new RegExp(/^\/top/),                       now: '/edpicks'},
  { regex: new RegExp(/^\/dig\?u=([0-9a-zA-Z]+)/),     now: '/people/$1'},
];

router.addRoutes( routes, rewriteRules );

module.exports = App;
