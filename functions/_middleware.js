export default {
  async fetch(request, env, ctx) {
    return new Response("내 페이지야! Hello World 아님", { status: 200 });
  }
};
