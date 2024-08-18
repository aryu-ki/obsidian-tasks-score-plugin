# Overview

This plugin calculates total score for the tasks on the page ([Tasks plugin](https://github.com/obsidian-tasks-group/obsidian-tasks))

# Usage

Just add score notation for your task like this
```
// before
- [x] My task ...
- [ ] My #2 task ...
// with score
- [x] [3] My task ...
- [ ] [5] My task ...
```
And then, anywhere in the code
````
```evals
Score: !score!/!target_score!
```
````

Which will evaluate in
```html
<h1>Score: 3/8</h1>
```
and be rendered as
# Score 3/8
