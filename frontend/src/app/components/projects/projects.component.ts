import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Project {
  _id?: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  image?: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.http.get<Project[]>('http://localhost:5000/api/projects')
      .subscribe({
        next: (data) => {
          this.projects = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading projects:', err);
          this.loading = false;
        }
      });
  }
}
