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

        function addElement() {

          if (document.querySelector('.comment-section')) return false;

          const commentSection = document.createElement("div");
          commentSection.classList.add("comment-section");

          const textComment = normalizeTextForm(posts_count, ['Комментарий', 'Комментария', 'Комментариев'])

          const newContent = document.createTextNode(`${posts_count} ${textComment}`);
          commentSection.appendChild(newContent);
          const firstPost = document.getElementById("post_1");
          firstPost.after(commentSection);
        }
        if (posts_count >= 0) {
          addElement();
        }
      });
    });
  }
};
