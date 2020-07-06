import { Injectable } from '@angular/core';
import { Exercise } from './exercise.model';
import { Subject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { UIService } from '../shared/ui.service';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  pastExercisesChanged = new Subject<Exercise[]>();

  private firebaseSubscriptions: Subscription[] = [];

  private runningExercise: Exercise;
  private availableExercises: Exercise[] = [];
  private exercises: Exercise[] = [];

  constructor(
    private firestore: AngularFirestore,
    private uiService: UIService
  ) { }

  fetchAvailableExercises() {
    /* tslint:disable:no-string-literal */
    this.firebaseSubscriptions.push(this.firestore.collection('availableExercises').snapshotChanges().pipe(map(docArray => {
      return docArray.map(doc => {
        return {
          id: doc.payload.doc.id,
          name: doc.payload.doc.data()['name'],
          calories: doc.payload.doc.data()['calories'],
          duration: doc.payload.doc.data()['duration']
        };
      });
    })).subscribe((exercises) => {
      this.availableExercises = exercises;
      this.exercisesChanged.next([...this.availableExercises]);
    },
      (error) => {
        this.uiService.showSnackBar('Cannot Load Exercises. Try Again Later', null, 3000);
      }));
    /* tslint:enable:no-string-literal */
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find((exercise) => exercise.id === selectedId);
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDataStore({ ...this.runningExercise, date: new Date(), state: 'completed' });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDataStore({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  getAllExercises() {
    return this.exercises.slice();
  }

  private addDataToDataStore(exercise: Exercise) {
    const userId: User = JSON.parse(sessionStorage.getItem('user'));
    this.firestore.collection('users/' + userId.uid + '/finishedExercises').add(exercise);
  }

  fetchCompletedExercises() {
    const userId: User = JSON.parse(sessionStorage.getItem('user'));
    this.firebaseSubscriptions.push(this.firestore.collection('users/' + userId.uid + '/finishedExercises').valueChanges().subscribe((exercises: Exercise[]) => {
      this.pastExercisesChanged.next(exercises);
    }));
  }

  cancelSubscriptions() {
    this.firebaseSubscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
