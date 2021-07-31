export class Task {
  private id: number;
  private state: "initial" | "ready" | "executing" | "finished" = "initial";

  constructor(
    private q: MainQueue,
    private callback: (instance: Task) => void
  ) {
    this.id = Math.ceil(Math.random() * 100000);
  }

  public ready() {
    this.q.registerNewTask(this);
  }

  public execute() {
    this.callback(this);
  }

  public done() {
    this.state = "finished";
    this.q.declareTaskEnds();
  }
}

export class MainQueue {
  private tasks: Task[] = [];
  private queueRunning = false;

  private isOnlyOne() {
    return this.tasks.length === 1;
  }
  private isEmpty() {
    return this.tasks.length === 0;
  }

  registerNewTask(instance: Task) {
    this.tasks.push(instance);

    if (this.queueRunning === false) return;

    if (!this.isOnlyOne()) return;

    instance.execute();
  }

  declareTaskEnds() {
    this.tasks.splice(0, 1);
    if (!this.isEmpty()) {
      this.tasks[0].execute();
    }
  }

  start() {
    this.queueRunning = true;
    if (this.tasks.length !== 0) this.tasks[0].execute();
  }
}
