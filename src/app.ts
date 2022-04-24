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

type Listener<T> = (projects: T[]) => {};

class State<T>{
    
    private listeners: Listener<T>[];
    private state: T[];

    public constructor(){
        this.listeners = [];
        this.state = [];
    }
    

    public addData (data: T){
        this.state.push(data);
        this.updateObservers();
    }

    public addListeners(listener: Listener<T>){
        this.listeners.push(listener);
    }
    private updateObservers(){
        for(let listener of this.listeners){
            listener(this.state);
        }
    }

}

enum ProjectStatus{
    Active = "active", Finished="finished"
}

class Project{
    public id: string;
    constructor(public title:string, public description: string, public people: number, public status: ProjectStatus){
        this.id = Math.random().toString(16);
    }
}

class ProjectState extends State<Project>{
    private static instance: ProjectState;
    private constructor(){
        super();
    }
    public static getInstance(){
        if(this.instance) return this.instance;
        this.instance = new ProjectState();
        return this.instance;

    }
}

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    rootElement: T;
    templateElement: HTMLTemplateElement;
    innerElement: U;
    insertionPosition: "afterbegin"|"beforeend";
    constructor(templateId: string, hostId: string, insertionPosition: "afterbegin"|"beforeend", newelementId?:string){
        this.rootElement = document.getElementById(hostId)! as T;
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.innerElement = document.importNode(this.templateElement.content, true).firstElementChild as U;
        if(newelementId)
        this.innerElement.id = newelementId;
        this.insertionPosition= insertionPosition;

        this.attach();
    }

    private attach() {
        this.rootElement.insertAdjacentElement(this.insertionPosition,this.innerElement);
    }

    public abstract configure(): void;
    public abstract renderComponent(): void;
}


class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {

    titleInputElement: HTMLInputElement;                                    
    descriptionInputElement: HTMLInputElement;                                    
    peopleInputElement: HTMLInputElement;                                    
    projectState: State<Project>;
    constructor() {
       super("project-input", "app", "afterbegin","user-input");
        this.projectState = ProjectState.getInstance();
        this.titleInputElement = this.innerElement.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.innerElement.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.innerElement.querySelector('#people')! as HTMLInputElement;
        this.configure();
        

    }

    public configure(): void {
        this.innerElement.addEventListener('submit', this.submitHandler);
    }
    public renderComponent(): void {
        
    }
    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            this.projectState.addData(new Project(title, description,people, ProjectStatus.Active));
            this.clearFields();
        }   
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        console.log(enteredDescription, enteredPeople, enteredTitle)
        if(enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
            alert('Invalid input, please try again');
            return;
        }
        return [enteredTitle, enteredDescription, +enteredPeople];
    }
    

    private clearFields() {
         this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
        
    }

}

const prjInput = new ProjectInput();