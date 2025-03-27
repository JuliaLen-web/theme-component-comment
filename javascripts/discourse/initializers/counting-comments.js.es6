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
          commentSection.classList.add("comment-content");

          const textComment = normalizeTextForm(posts_count, ['Комментарий', 'Комментария', 'Комментариев'])

          const newContent = document.createTextNode(`${posts_count} ${textComment}`);
          commentSection.appendChild(newContent);

          parent.appendChild(commentSection);
          return parent;
        }

        function createButton(parent) {

          const buttonComment = document.createElement("div");
          buttonComment.classList.add("btn-comment");

          if (api.getCurrentUser() === null) {
            const buttonComment = document.createElement("a");

            buttonComment.classList.add("btn-comment");
            buttonComment.appendChild(document.createTextNode('Добавить комментарий'))
            buttonComment.setAttribute('href', 'https://brokensun.com/auth/oauth2_basic/?login=1&language=ru&redirect_uri=%2Fru%2Fnews%2Fnovye-predmety-uzhe-v-igre-test%2F26950%2F');
            buttonComment.setAttribute('onclick',"elclick('button_click','login');")

            parent.appendChild(buttonComment);
          } else {
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
          }

          return parent;
        }

        function addElement() {

          if (document.querySelector('.comment-section') || !document.getElementById("post_1")) return false;

          const commentSectionWrapper = document.createElement("div");
          commentSectionWrapper.classList.add("comment-section");
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
