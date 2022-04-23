class ProjectInput {
    rootElement: HTMLDivElement;
    templateElement: HTMLTemplateElement;
    innerElement: HTMLFormElement;

    constructor() {
        this.rootElement = document.getElementById('app')! as HTMLDivElement;
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.innerElement = document.importNode(this.templateElement.content, true).firstElementChild as HTMLFormElement;
        this.innerElement.id = "user-input";
        this.attach();

    }

    private attach() {
        this.rootElement.appendChild(this.innerElement);
    }

}

const prjInput = new ProjectInput();