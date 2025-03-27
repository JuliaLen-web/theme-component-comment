import { withPluginApi } from "discourse/lib/plugin-api";
import { authorizesOneOrMoreExtensions } from "discourse/lib/uploads";
import discourseComputed from "discourse-common/utils/decorators";

const PLUGIN_ID = "discourse-count-comments";

export default {
  name: PLUGIN_ID,
  initialize() {
    withPluginApi("0.8", api => {
      function normalizeTextForm(number, words_arr) {
        number = Math.abs(number);
        const options = [2, 0, 1, 1, 1, 2];
        return words_arr[(number % 100 > 4 && number % 100 < 20) ? 2 : options[(number % 10 < 5) ? number % 10 : 5]];
      }

      api.onPageChange((url, title) => {
        let posts_count = api.container.lookup("controller:topic").get("model.posts_count") - 1;

        function createComment(parent) {
          const commentSection = document.createElement("div");
          commentSection.classList.add("comment-section");

          const textComment = normalizeTextForm(posts_count, ['Комментарий', 'Комментария', 'Комментариев'])

          const newContent = document.createTextNode(`${posts_count} ${textComment}`);
          commentSection.appendChild(newContent);

          parent.appendChild(commentSection);
          return parent;
        }

        function createButton(parent) {
          console.log(api.getCurrentUser())

          const buttonComment = document.createElement("div");
          buttonComment.classList.add("btn-comment");

          buttonComment.appendChild(document.createTextNode('Добавить комментарий'))

          buttonComment.addEventListener('click', ()=> {
            const { REPLY } = require('discourse/models/composer').default;

            const composer = Discourse.__container__.lookup('controller:composer');

            setTimeout(function() {
              const topic = Discourse.__container__.lookup("controller:topic").get("model");
              if (topic) {
                composer.open({
                  action: REPLY,
                  draftKey: topic.draft_key,
                  draftSequence: topic.draft_sequence,
                  topic,
                });
              }
            }, 0)
          })

          parent.appendChild(buttonComment);
          return parent;
        }

        function addElement() {

          if (document.querySelector('.comment-section') || !document.getElementById("post_1") || document.querySelector('.btn-auth-wrapper')) return false;

          const commentSectionWrapper = document.createElement("div");

          createComment(commentSectionWrapper);
          createButton(commentSectionWrapper);

          const firstPost = document.getElementById("post_1");
          firstPost.after(commentSectionWrapper);
        }
        if (posts_count >= 0) {
          addElement();
        }
      });
    });
  }
};
