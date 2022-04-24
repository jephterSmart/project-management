
//Decorator
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
//Utility Function
interface Validatable {
    value: string | number;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    required?: boolean;
}
function validate(validatable: Validatable){
    let isValid = true;
    if(validatable.required){
        isValid = isValid && validatable.value.toString().trim().length !== 0;
    }
    if(validatable.minLength && typeof validatable.value == "string"){
        isValid = isValid && validatable.value.trim().length >= validatable.minLength;
    }
    if(validatable.maxLength && typeof validatable.value == "string"){
        isValid = isValid && validatable.value.trim().length <= validatable.maxLength;
    }
    if(validatable.min && typeof validatable.value == "number"){
        isValid = isValid && validatable.value >= validatable.min;
    }
    if(validatable.max && typeof validatable.value == "number"){
        isValid = isValid && validatable.value <= validatable.max;
    }
    return isValid;
}

type Listener<T> = (projects: T[]) => void;

//DnD
interface Draggable{
    onDragStart(event: DragEvent): void;
    onDragEnd(event: DragEvent): void;
}

interface Droppable{
    onDropHover(event: DragEvent): void;
    onDrop(event: DragEvent): void;
    onDragLeave(event: DragEvent): void;
}

class State<T>{
    
    private listeners: Listener<T>[];
    protected state: T[];

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
    protected updateObservers(){
        
        for(let listener of this.listeners){
            listener(this.state.slice());
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
    get persons(){
        if(this.people == 1)
            return "1 Person";
        return `${this.people} Persons`;
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
    public updateStatus(projectId: string, projectStatus: ProjectStatus){
       const project =  this.state.find(project => project.id == projectId);
       if(project){
            project.status = projectStatus;
            const projectInd = this.state.findIndex(project => project.id == projectId);
            this.state[projectInd] = project;
            this.updateObservers();
       }

    }
}

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    rootElement: T;
    templateElement: HTMLTemplateElement;
    protected innerElement: U;
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


class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>  {

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
            console.log(userInput)
            this.clearFields();
        }   
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        
        const isTitleValid = validate({value:enteredTitle, required:true, minLength:5});
        const isDescriptionValid = validate({value:enteredDescription, required:true, minLength:10});
        const isAmountOfPersonsValid = validate({value: +enteredPeople, required:true, min:1,max:10});
        if(!(isTitleValid ||isDescriptionValid || isAmountOfPersonsValid)) {
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

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements Droppable{
    projectState: ProjectState;
   
    constructor(private type: ProjectStatus){
        super("project-list", "app","beforeend",`${type}-projects`);
        this.projectState = ProjectState.getInstance();
        

        const h2Element = this.innerElement.querySelector("h2")!;
        const ulElement = this.innerElement.querySelector(`#${this.type}-projects ul`)! as HTMLUListElement;
        h2Element.textContent = type.toString().toUpperCase();
        ulElement.id = `${this.type}-list`;
        this.projectState.addListeners(this.getUpdatedProjects)
        
    }
    @Autobind
    private getUpdatedProjects(projects: Project[]){
        const ulElement = this.innerElement.querySelector(`#${this.type}-projects ul`)! as HTMLUListElement;
        ulElement.innerHTML = "";
        
        for(const project of projects){
            if(project.status == this.type)
            new ProjectItem(project,`${this.type}-list`);
        }
        this.configure();
    }
    public configure(): void {
      this.innerElement.addEventListener("dragover", this.onDropHover);
      this.innerElement.addEventListener("drop",this.onDrop);
      this.innerElement.addEventListener('dragleave', this.onDragLeave);
    }
    public renderComponent(): void {
        
    }
    @Autobind
    onDropHover(event: DragEvent): void {
        event.preventDefault();
        const dataTransfer = event.dataTransfer!;
        dataTransfer.effectAllowed = 'move';
        if(dataTransfer?.types[0] == 'plain/text')
            this.innerElement.classList.add("droppable");
    }
    @Autobind
    onDragLeave(_: DragEvent): void {
        this.innerElement.classList.remove('droppable');
        
    }
    @Autobind
    onDrop(event: DragEvent): void {
        
        this.projectState.updateStatus(event.dataTransfer?.getData("text/plain") as string, ProjectStatus.Finished);
    }
}
class ProjectItem extends Component<HTMLUListElement,HTMLLIElement> implements Draggable{
    constructor(private project: Project, private hostId: string){

        super("single-project", hostId, "beforeend", project.id);
        const titleElement = this.innerElement.querySelector("h2")!;
        const descriptionElement = this.innerElement.querySelector("p")!;
        const peopleElement = this.innerElement.querySelector("h3")!;
        titleElement.textContent = project.title;
        descriptionElement.textContent = project.description;
        peopleElement.textContent = project.persons + " assigned";

        this.configure()
    }

    public configure(): void {
        this.innerElement.addEventListener("dragstart", this.onDragStart);
        this.innerElement.addEventListener("dragend", this.onDragEnd);
    }
    public renderComponent(): void {
        
    }
    @Autobind
    onDragStart(event: DragEvent): void {
        const parentElement = document.getElementById(this.hostId)!;
        parentElement.classList.add("draggable");
        event?.dataTransfer?.setData('text/plain',this.project.id)
    }
    @Autobind
    onDragEnd(_: DragEvent): void {
        const parentElement = document.getElementById(this.hostId)!;
        parentElement.classList.remove("draggable");
    }
} 
new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);
