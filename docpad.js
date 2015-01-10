'use strict';

var docpadConfig;

docpadConfig = {
  poweredByDocPad: true,
  maxAge: 3600000,
  templateData: {
    site: {
      title: "JTWebMan"
    },
    getPreparedTitle: function () {
      if (this.document.title) {
        return this.document.title + " | " + this.site.title;
      }
      return this.site.title;
    },
    getCuttedContent: function (content) {
      var i = content.search('<!-- Read more -->');
      if (i >= 0) {
        return content.slice(0, +(i - 1) + 1 || 9e9);
      }
      return content;
    },
    hasReadMore: function (content) {
      return content.search('<!-- Read more -->') >= 0;
    }
  },
  collections: {
    pages: function () {
      return this.getCollection("html").findAllLive({
        layout: { $has: 'page' },
        isPagedAuto: { $ne: true }
      }, [
        { sort: 1 }
      ]);
    },
    posts: function () {
      return this.getCollection("html").findAllLive({
        layout: { $has: 'blog' }
      }, [
        { date: -1 }
      ]);
    }
  },
  plugins: {
    cleanurls: {
      trailingSlashes: true
    },
    grunt: {
      warnOnError: true
    }
  }
};

module.exports = docpadConfig;
