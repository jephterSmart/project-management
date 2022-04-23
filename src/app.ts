function Autobind(_:Object, _2:string, descriptor:PropertyDescriptor) {
    var originalMethod = descriptor.value;
    var adjDescriptor = {
        configurable: true,
        get() {
            var boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

class ProjectInput {
    rootElement: HTMLDivElement;
    templateElement: HTMLTemplateElement;
    innerElement: HTMLFormElement;

    titleInputElement: HTMLInputElement;                                    
    descriptionInputElement: HTMLInputElement;                                    
    peopleInputElement: HTMLInputElement;                                    

    constructor() {
        this.rootElement = document.getElementById('app')! as HTMLDivElement;
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.innerElement = document.importNode(this.templateElement.content, true).firstElementChild as HTMLFormElement;
        this.innerElement.id = "user-input";
        this.titleInputElement = this.innerElement.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.innerElement.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.innerElement.querySelector('#people')! as HTMLInputElement;
        this.innerElement.addEventListener('submit', this.submitHandler);
        this.attach();

    }
    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
        }   
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        if(enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
            alert('Invalid input, please try again');
            return;
        }
        return [enteredTitle, enteredDescription, +enteredPeople];
    }
    private attach() {
        this.rootElement.appendChild(this.innerElement);
    }

}

const prjInput = new ProjectInput();