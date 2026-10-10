import assert from "node:assert/strict";
import test from "node:test";
import { getPostNavigation } from "../src/utils/getPostNavigation.ts";

const post = (id, course) => ({ id, data: { title: id, course } });

test("讲义的前后讲按课程顺序选择，不跟随全站时间线", () => {
  const first = post("lecture-one", "linear-algebra");
  const middle = post("lecture-two", "linear-algebra");
  const last = post("lecture-three", "linear-algebra");
  const independent = post("a-note");
  const otherCourse = post("another-course", "calculus");
  const timeline = [last, independent, middle, otherCourse, first];

  const navigation = getPostNavigation(middle, timeline, [first, middle, last]);

  assert.equal(navigation.prevPost?.id, "lecture-one");
  assert.equal(navigation.nextPost?.id, "lecture-three");
});

test("第一讲与最后一讲的导航不越过课程边界", () => {
  const first = post("lecture-one", "linear-algebra");
  const middle = post("lecture-two", "linear-algebra");
  const last = post("lecture-three", "linear-algebra");
  const lectures = [first, middle, last];
  const timeline = [post("a-note"), last, middle, first, post("old-note")];

  assert.deepEqual(getPostNavigation(first, timeline, lectures), {
    prevPost: null,
    nextPost: middle,
  });
  assert.deepEqual(getPostNavigation(last, timeline, lectures), {
    prevPost: middle,
    nextPost: null,
  });
});

test("单讲课程不生成全站时间线中的前后篇", () => {
  const lecture = post("only-lecture", "single-course");
  const timeline = [post("new-note"), lecture, post("old-note")];

  assert.deepEqual(getPostNavigation(lecture, timeline, [lecture]), {
    prevPost: null,
    nextPost: null,
  });
});

test("独立文章仍按全站时间线切换，邻接讲义不被过滤", () => {
  const newer = post("newer-lecture", "calculus");
  const independent = post("a-note");
  const older = post("older-lecture", "linear-algebra");

  assert.deepEqual(
    getPostNavigation(independent, [newer, independent, older], []),
    {
      prevPost: older,
      nextPost: newer,
    }
  );
});

test("课程索引中没有当前讲义时不退回全站导航", () => {
  const lecture = post("unlisted-lecture", "linear-algebra");
  const timeline = [post("new-note"), lecture, post("old-note")];

  assert.deepEqual(getPostNavigation(lecture, timeline, []), {
    prevPost: null,
    nextPost: null,
  });
});
